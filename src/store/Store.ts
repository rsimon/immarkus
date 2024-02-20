import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, FolderItems, Image, LoadedImage, RootFolder } from '@/model';
import { generateShortId, hasSelector, readImageFile, readJSONFile, writeJSONFile } from './utils';
import { loadDataModel, DataModelStore } from './datamodel/DataModelStore';
import { repairAnnotations } from './integrity/annotationIntegrity';

export interface Store {
  
  folders: Folder[];

  images: Image[];

  countAnnotations(imageId: string, withSelectorOnly?: boolean): Promise<number>;

  deleteAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  getAnnotations(imageId: string, opts?: { type: 'image' | 'metadata' | 'both' }): Promise<W3CAnnotation[]>;

  getDataModel(): DataModelStore;

  getFolder(folderId: string | FileSystemDirectoryHandle): Folder;

  getFolderContents(dir: FileSystemDirectoryHandle): FolderItems;

  getFolderMetadata(folderId: string): Promise<W3CAnnotation>;

  getImage(imageId: string): Image;

  getImageMetadata(imageId: string): Promise<W3CAnnotationBody | undefined>;

  getRootFolder(): RootFolder;

  loadImage(id: string): Promise<LoadedImage>;

  upsertAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  upsertFolderMetadata(folderId: string, annotation: W3CAnnotation): Promise<void>;
  
  upsertImageMetadata(imageId: string, metadata: W3CAnnotationBody): Promise<void>;

}

const getAnnotationsFile = (image: Image) => {
  const filename = `${image.name.substring(0, image.name.lastIndexOf('.'))}.json`;
  return image.folder.getFileHandle(filename, { create: true });
}

const loadDirectory = async (
  dirHandle: FileSystemDirectoryHandle, 
  path: string[] = [],
  images: Image[] = [], 
  folders: Folder[] = []
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
        }
      }
    } catch (error) {
      console.error(`Error openeing fs entry: ${entry.name}`, error);
    }
  }

  return { images, folders };

}

export const loadStore = (
  rootDir: FileSystemDirectoryHandle
): Promise<Store> => new Promise(async resolve => {

  const { images, folders } = await loadDirectory(rootDir);

  const datamodel = await loadDataModel(rootDir);

  const cachedAnnotations = new Map<string, W3CAnnotation[]>();

  const countAnnotations = (
    imageId: string, withSelectorOnly = true
  ): Promise<number> => getAnnotations(imageId).then(annotations => {
    if (withSelectorOnly) {
      return annotations.filter(a => 'selector' in a.target).length;
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
      const annotations = await getAnnotations(imageId);
      const next = annotations.filter(a => a.id !== annotation.id);

      cachedAnnotations.set(imageId, next);

      const fileHandle = await getAnnotationsFile(img);
      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      reject(Error(`Image ${imageId} not found`));
    }
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
      : folders.find(f => f.handle === arg);

  const getFolderContents = (dir: FileSystemDirectoryHandle): FolderItems => {
    const imageItems = images.filter(i => i.folder === dir);
    const folderItems = folders.filter(f => f.parent === dir);
    return { images: imageItems, folders: folderItems };
  }

  const getFolderMetadata = (folderId: string): Promise<W3CAnnotation> => {
    const folder = getFolder(folderId);
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

  const upsertAnnotation = (
    imageId: string, 
    annotation: W3CAnnotation
  ): Promise<void> => new Promise(async (resolve, reject) => {
    const img = images.find(i => i.id === imageId);
    if (img) {
      const annotations = await getAnnotations(imageId);

      const exists = annotations.find(a => a.id === annotation.id);
      const next = exists ? 
        annotations.map(a => a.id === annotation.id ? annotation : a) :
        [...annotations, annotation];
      
      cachedAnnotations.set(imageId, next);

      const fileHandle = await getAnnotationsFile(img);
      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      reject(Error(`Image ${imageId} not found`));
    }
  });

  const upsertFolderMetadata = (folderId: string, annotation: W3CAnnotation): Promise<void> => {
    const folder = getFolder(folderId);
    if (folder) {
      return folder.handle.getFileHandle('_immarkus.folder.meta.json', { create: true })
        .then(handle => writeJSONFile(handle, annotation))
    } else {
      return Promise.reject(`Missing folder: ${folderId}`);
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

  resolve({
    folders,
    images,
    countAnnotations,
    deleteAnnotation,
    getAnnotations,
    getDataModel,
    getFolder,
    getFolderContents,
    getFolderMetadata,
    getImage,
    getImageMetadata,
    getRootFolder,
    loadImage,
    upsertAnnotation,
    upsertFolderMetadata,
    upsertImageMetadata
  });

});
 