import { W3CAnnotation, W3CAnnotationBody, W3CImageAnnotation } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, FolderItems, Image, LoadedImage, RootFolder } from '@/model';
import { generateShortId, hasSelector, readImageFile, readJSONFile, writeJSONFile } from './utils';
import { loadDataModel, DataModelStore } from './datamodel/DataModelStore';
import { repairAnnotations } from './integrity/annotationIntegrity';
import { loadRelationStore, RelationStore } from './relations/RelationStore';
import { IIIFResource } from '@/model/IIIFResource';

export interface AnnotationStore {
  
  folders: Folder[];

  images: Image[];

  bulkDeleteAnnotations(imageId: string, annotations: W3CAnnotation[]): Promise<void>;

  bulkUpsertAnnotation(imageId: string, annotations: W3CAnnotation[]): Promise<void>;

  countAnnotations(imageId: string, withSelectorOnly?: boolean): Promise<number>;

  deleteAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  findAnnotation(annotationId: string): Promise<[W3CAnnotation, Image] | undefined>;

  findImageForAnnotation(annotationId: string): Promise<Image>;

  getAnnotations(imageId: string, opts?: { type: 'image' | 'metadata' | 'both' }): Promise<W3CAnnotation[]>;

  getDataModel(): DataModelStore;

  getFolder(idOrHandle: string | FileSystemDirectoryHandle): Folder | RootFolder;

  getFolderContents(dir: FileSystemDirectoryHandle): FolderItems;

  getFolderMetadata(idOrHandle: string | FileSystemDirectoryHandle): Promise<W3CAnnotation>;

  getImage(imageId: string): Image;

  getImageMetadata(imageId: string): Promise<W3CAnnotationBody | undefined>;

  getRootFolder(): RootFolder;

  listImagesInFolder(folderId: string): Image[];

  loadImage(id: string): Promise<LoadedImage>;

  upsertAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  upsertFolderMetadata(idOrHandle: string | FileSystemDirectoryHandle, annotation: W3CAnnotation): Promise<void>;
  
  upsertImageMetadata(imageId: string, metadata: W3CAnnotationBody): Promise<void>;

}

export type Store = AnnotationStore & RelationStore;

const getAnnotationsFile = (image: Image) => {
  const filename = `${image.name.substring(0, image.name.lastIndexOf('.'))}.json`;
  return image.folder.getFileHandle(filename, { create: true });
}

const loadDirectory = async (
  dirHandle: FileSystemDirectoryHandle, 
  path: string[] = [],
  images: Image[] = [], 
  folders: Folder[] = [],
  iiifResources: IIIFResource[] = []
): Promise<FolderItems> => {

  for await (const entry of dirHandle.values()) {
    try {
      if (entry.kind === 'directory') {
        const subDirHandle = await dirHandle.getDirectoryHandle(entry.name);

        const { name } = subDirHandle;
        const id = await generateShortId(`${path.join('/')}/${dirHandle.name}/${name}`); 
        
        folders.push({ id, name, path, handle: subDirHandle, parent: dirHandle });

        const nextPath = [...path, id ];
        await loadDirectory(subDirHandle, nextPath, images, folders);
      } else {
        const fileHandle = await dirHandle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();

        if (file.type.startsWith('image')) {
          const { name } = file;
          const id = await generateShortId(`${path.join('/')}/${dirHandle.name}/${name}`); 

          images.push({ id, name, path, file, folder: dirHandle });
        } else {
          // TODO load IIIF resource pointers
        }
      }
    } catch (error) {
      console.error(`Error openeing fs entry: ${entry.name}`, error);
    }
  }

  return { images, folders, iiifResources };

}

export const loadStore = (
  rootDir: FileSystemDirectoryHandle
): Promise<Store> => new Promise(async resolve => {

  const { images, iiifResources, folders } = await loadDirectory(rootDir);

  const datamodel = await loadDataModel(rootDir);

  const cachedAnnotations = new Map<string, W3CAnnotation[]>();

  const countAnnotations = (
    imageId: string, withSelectorOnly = true
  ): Promise<number> => getAnnotations(imageId).then(annotations => {
    if (withSelectorOnly) {
      return annotations.filter(a => typeof a.target === 'object' && 'selector' in a.target).length;
    } else {
      return annotations.length;
    }
  });

  const deleteAnnotation = (
    imageId: string, 
    annotation: W3CAnnotation
  ): Promise<void> => new Promise(async (resolve, reject) => {
    const img = images.find(i => i.id === imageId);
    if (img) {
      const all = await getAnnotations(imageId);
      const next = all.filter(a => a.id !== annotation.id);

      cachedAnnotations.set(imageId, next);

      const fileHandle = await getAnnotationsFile(img);
      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      reject(Error(`Image ${imageId} not found`));
    }
  });

  const bulkDeleteAnnotations = (
    imageId: string,
    annotations: W3CAnnotation[]
  ): Promise<void> => new Promise(async (resolve, reject) => {
    const img = images.find(i => i.id === imageId);
    if (img) {
      const toDelete = new Set(annotations.map(a => a.id));

      const all = await getAnnotations(imageId);
      const next = all.filter(a => !toDelete.has(a.id));

      cachedAnnotations.set(imageId, next);

      const fileHandle = await getAnnotationsFile(img);
      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      reject(Error(`Image ${imageId} not found`));
    }
  });

  const findAnnotation = (annotationId: string) => {
    // Let's try cached anntoations first
    for (const [imageId, annotations] of cachedAnnotations.entries()) {
      const found = annotations.find(a => a.id === annotationId);
      if (found)
        return Promise.resolve([found, getImage(imageId)] as [W3CImageAnnotation, Image]);
    }

    // Not cached - not much we can do except go through all images we
    // haven't loaded yet.
    const cachedImageIds = new Set([...cachedAnnotations.keys()]);

    const uncachedImages = images.filter(i => !cachedImageIds.has(i.id));

    return uncachedImages.reduce<Promise<[W3CAnnotation, Image] | undefined>>((promise, image) => promise.then(result => {
      if (result) return result; // Skip

      // Load annotations for this image
      return getAnnotations(image.id).then(annotations => {
        const found = annotations.find(a => a.id === annotationId);
        if (found) {
          return [found, image] as [W3CImageAnnotation, Image];
        } else {
          return;
        }
      });
    }), Promise.resolve(undefined));
  }

  const findImageForAnnotation = (annotationId: string) =>
    findAnnotation(annotationId).then(match => {
      return match ? match[1] : undefined;
    });


  const getAnnotations = (
    imageId: string,
    opts: { type: 'image' | 'metadata' | 'both' } = { type: 'both' }
  ): Promise<W3CAnnotation[]> => new Promise(async resolve => {

    const filterByOpts = (annotations: W3CAnnotation[]) =>
      opts.type === 'image' ? annotations.filter(a => hasSelector(a))  :
      opts.type === 'metadata' ? annotations.filter(a => !hasSelector(a)) :
      annotations;

    const cached = cachedAnnotations.get(imageId);
    if (cached) {
      // A precaution. The data model could have changed meanwhile
      const repaired = repairAnnotations(cached, datamodel);
      cachedAnnotations.set(imageId, repaired);
      resolve(filterByOpts(repaired));
    } else {
      const image = images.find(i => i.id === imageId);
      if (image) {
        const fileHandle = await getAnnotationsFile(image);
        const file = await fileHandle.getFile();

        readJSONFile<W3CAnnotation[]>(file)
          .then(data => {
            const annotations = repairAnnotations(data || [], datamodel);
            cachedAnnotations.set(imageId, annotations);
            resolve(filterByOpts(annotations));
          })
          .catch(() => {
            cachedAnnotations.set(imageId, []);
            resolve([]);
          });
      } else {
        console.warn(`Image ${imageId} not found`);
        resolve([]);
      }
    }
  });

  const getDataModel = () => datamodel;

  const getFolder = (arg: string | FileSystemDirectoryHandle) =>
    typeof arg === 'string' 
      ? folders.find(f => f.id === arg) 
      : arg === rootDir 
        ? getRootFolder() 
        : folders.find(f => f.handle === arg);

  const getFolderContents = (dir: FileSystemDirectoryHandle): FolderItems => {
    const imageItems = images.filter(i => i.folder === dir);
    const iiifItems = iiifResources.filter(i => i.folder === dir);
    const folderItems = folders.filter(f => f.parent === dir);
    return { images: imageItems, folders: folderItems, iiifResources: iiifItems };
  }

  const getFolderMetadata = (idOrHandle: string | FileSystemDirectoryHandle): Promise<W3CAnnotation> => {
    const folder = getFolder(idOrHandle);
    if (folder) {
      return folder.handle.getFileHandle('_immarkus.folder.meta.json', { create: true })
        .then(handle => handle.getFile())
        .then(file => readJSONFile<W3CAnnotation>(file))
    } else {
      return Promise.reject();
    }
  }

  const getImage = (id: string) => images.find(f => f.id === id);

  const _getImageMetadataAnnotation = (imageId: string): Promise<W3CAnnotation | undefined> =>
    getAnnotations(imageId, { type: 'metadata' }).then(annotations => {
      if (annotations.length > 1)
        console.warn(`Integrity error: multiple metadata annotations for image ${imageId}`, annotations);
      
      if (annotations.length === 0)
        return;

      return annotations[0];
    });

  const getImageMetadata = (imageId: string): Promise<W3CAnnotationBody | undefined> =>
    _getImageMetadataAnnotation(imageId).then(annotation => {
      if (!annotation) return;

      if (Array.isArray(annotation.body)) {
        if (annotation.body.length !== 1) {
          console.warn(`Integrity error: metadata annotation for image ${imageId} has != 1 body`);
        } else {
          return annotation.body[0] as W3CAnnotationBody;
        }
      } else if (!annotation.body) {
        console.warn(`Integrity error: metadata annotation for image ${imageId} has no body`);
      } else {
        return annotation.body;
      }
    });

  const getRootFolder = () => ({
    name: rootDir.name, path: [], handle: rootDir
  });

  const listImagesInFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);

    const listImagesRecursive = (folder: Folder, allImages: Image[] = []) => {
      const { folders, images } = getFolderContents(folder.handle);
      if (folders.length === 0) {
        return [...allImages, ...images];
      } else {
        return [
          ...allImages,
          ...images, 
          ...folders.reduce<Image[]>((all, folder) => (
            [...all, ...listImagesRecursive(folder)]
          ), [])]
      }
    }
    
    if (folder) {
      return listImagesRecursive(folder);
    } else {
      return [];
    }
  }

  const loadImage = (
    id: string
  ): Promise<LoadedImage> => new Promise((resolve, reject) => {
    const img = images.find(i => i.id === id);
    if (img) {
      readImageFile(img.file).then(data => {
        resolve({...img, data });
      }).catch(error => {
        console.error(error);
      })
    } else {
      reject(Error(`Image ${id} not found`));
    }
  });

  const _upsertOneAnnotation = (
    imageId: string, 
    annotation: W3CAnnotation
  ): Promise<W3CAnnotation[]> => new Promise(async (resolve, reject) => {
    const img = images.find(i => i.id === imageId);
    if (img) {
      const annotations = await getAnnotations(imageId);

      const exists = annotations.find(a => a.id === annotation.id);
      const next = exists ? 
        annotations.map(a => a.id === annotation.id ? annotation : a) :
        [...annotations, annotation];

      cachedAnnotations.set(imageId, next);
      resolve(next);
    } else {
      reject(Error(`Image ${imageId} not found`));
    }
  });

  const upsertAnnotation = (
    imageId: string, 
    annotation: W3CAnnotation
  ): Promise<void> => _upsertOneAnnotation(
    imageId,
    annotation
  ).then(next => new Promise(async (resolve, reject) => {
    const img = images.find(i => i.id === imageId);
    if (img) {
      const fileHandle = await getAnnotationsFile(img);
      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      // Should never happen
      reject(Error(`Image ${imageId} not found`));
    }
  }));

  const bulkUpsertAnnotation = async (
    imageId: string, 
    annotations: W3CAnnotation[]
  ): Promise<void> => {
    // Upsert each annotation in sequence
    const next = await annotations.reduce<Promise<W3CAnnotation[]>>((promise, annotation) => {
      return promise.then(() => _upsertOneAnnotation(imageId, annotation)).then(next => {
        return next;
      })
    }, Promise.resolve([]));

    const img = images.find(i => i.id === imageId);
    if (img) {
      const fileHandle = await getAnnotationsFile(img);
      await writeJSONFile(fileHandle, next);
    }
  }

  const upsertFolderMetadata = (idOrHandle: string | FileSystemDirectoryHandle, annotation: W3CAnnotation): Promise<void> => {
    const folder = getFolder(idOrHandle);
    if (folder) {
      return folder.handle.getFileHandle('_immarkus.folder.meta.json', { create: true })
        .then(handle => writeJSONFile(handle, annotation))
    } else {
      return Promise.reject(`Missing folder: ${idOrHandle}`);
    }
  }

  const upsertImageMetadata = (imageId: string, metadata: W3CAnnotationBody): Promise<void> =>
    _getImageMetadataAnnotation(imageId).then(existing => {
      const annotation = existing || {
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        type: 'Annotation',
        id: uuidv4(),
        target: {
          source: imageId
        }
      };
  
      const next = { 
        ...annotation,
        body: {
          ...metadata,
          purpose: 'describing'
        }
      } as W3CAnnotation;
  
      upsertAnnotation(imageId, next);
    });

  const store = {
    folders,
    images,
    bulkDeleteAnnotations,
    bulkUpsertAnnotation,
    countAnnotations,
    deleteAnnotation,
    findAnnotation,
    findImageForAnnotation,
    getAnnotations,
    getDataModel,
    getFolder,
    getFolderContents,
    getFolderMetadata,
    getImage,
    getImageMetadata,
    getRootFolder,
    listImagesInFolder,
    loadImage,
    upsertAnnotation,
    upsertFolderMetadata,
    upsertImageMetadata
  }

  const relations = await loadRelationStore(rootDir, store);
  
  resolve({...store, ...relations });

});
 