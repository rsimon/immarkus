import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { FileImage, Folder, FolderItems, Image, LoadedFileImage, LoadedImage, RootFolder } from '@/model';
import { parseIIIFId } from '@/utils/iiif';
import { generateShortId, hasSelector, readImageFile, readJSONFile, writeJSONFile } from './utils';
import { loadDataModel, DataModelStore } from './datamodel/DataModelStore';
import { repairAnnotations } from './integrity/annotationIntegrity';
import { loadRelationStore, RelationStore } from './relations/RelationStore';
import { 
  CanvasInformation, 
  IIIFManifestResource, 
  IIIFResource, 
  IIIFResourceInformation 
} from '@/model/IIIFResource';

export interface AnnotationStore {
  
  folders: Folder[];

  iiifResources: IIIFResource[];

  images: FileImage[];

  bulkDeleteAnnotations(imageId: string, annotations: W3CAnnotation[]): Promise<void>;

  bulkUpsertAnnotation(imageId: string, annotations: W3CAnnotation[]): Promise<void>;

  countAnnotations(imageId: string, withSelectorOnly?: boolean): Promise<number>;

  deleteAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  findAnnotation(annotationId: string): Promise<[W3CAnnotation, FileImage | CanvasInformation] | undefined>;

  findImageForAnnotation(annotationId: string): Promise<Image | CanvasInformation>;

  getAnnotations(imageId: string, opts?: { type: 'image' | 'metadata' | 'both' }): Promise<W3CAnnotation[]>;

  getCanvas(id: string): CanvasInformation | undefined;

  getCanvasAnnotations(id: string): Promise<W3CAnnotation[]>;

  getDataModel(): DataModelStore;

  getFolder(idOrHandle: string | FileSystemDirectoryHandle): Folder | RootFolder;

  getFolderContents(dir: FileSystemDirectoryHandle): FolderItems;

  getFolderMetadata(idOrHandle: string | FileSystemDirectoryHandle): Promise<W3CAnnotation>;

  getIIIFResource(id: string): IIIFResource;

  getImage(imageId: string): Image;

  getImageMetadata(imageId: string): Promise<W3CAnnotationBody | undefined>;

  getRootFolder(): RootFolder;

  importIIIFResource(info: IIIFResourceInformation, folderId?: string): Promise<IIIFResource>;

  listImagesInFolder(folderId: string): Image[];

  loadImage(id: string): Promise<LoadedImage>;

  removeIIIFResource(resource: IIIFResource): Promise<void>;

  upsertAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  upsertFolderMetadata(idOrHandle: string | FileSystemDirectoryHandle, annotation: W3CAnnotation): Promise<void>;
  
  upsertImageMetadata(imageId: string, metadata: W3CAnnotationBody): Promise<void>;

}

export type Store = AnnotationStore & RelationStore;

const getAnnotationsFile = (source: FileImage | IIIFResource) => {
  if ('file' in source) {
    const filename = `${source.name.substring(0, source.name.lastIndexOf('.'))}.json`;
    return source.folder.getFileHandle(filename, { create: true });
  } else {
    const filename = `_iiif.${source.id}.annotations.json`;
    return source.folder.getFileHandle(filename, { create: true });
  }
}

const loadDirectory = async (
  dirHandle: FileSystemDirectoryHandle, 
  path: string[] = [],
  images: FileImage[] = [], 
  iiifResources: IIIFResource[] = [],
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
        await loadDirectory(subDirHandle, nextPath, images, iiifResources, folders);
      } else {
        const fileHandle = await dirHandle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();

        if (file.type.startsWith('image')) {
          const { name } = file;
          const id = await generateShortId(`${path.join('/')}/${dirHandle.name}/${name}`); 

          images.push({ id, name, path, file, folder: dirHandle });
        } else if (file.type === 'application/json' && file.name.startsWith('_iiif.') && !file.name.endsWith('.annotations.json')) {
          const data: any = await readJSONFile(file);
          iiifResources.push({ 
            path, 
            folder: dirHandle, 
            ...data
          });
        }
      }
    } catch (error) {
      console.error(`Error openeing fs entry: ${entry.name}`, error);
    }
  }

  return { folders, iiifResources, images };

}

export const loadStore = (
  rootDir: FileSystemDirectoryHandle
): Promise<Store> => new Promise(async resolve => {

  const { iiifResources, folders, images } = await loadDirectory(rootDir);

  const datamodel = await loadDataModel(rootDir);

  const cachedAnnotations = new Map<string, W3CAnnotation[]>();

  /** Helpers **/
  const _findSource = (id: string): FileImage | IIIFResource | undefined => {
    if (id.startsWith('iiif:')) {
      const [manifestId, _] = id.substring('iiif:'.length).split(':');
      return iiifResources.find(r => r.id === manifestId);
    } else {
      return images.find(i => i.id === id);
    }
  }

  const _normalizeSourceId = (id: string) => {
    if (id.startsWith('iiif:')) {
      const [manifestId, _] = id.substring('iiif:'.length).split(':');
      return `iiif:${manifestId}`;
    } else {
      return id;
    }
  }

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
    sourceOrSourceId: FileImage | IIIFResource | string, 
    annotation: W3CAnnotation
  ): Promise<void> => new Promise(async (resolve, reject) => {
    const id = typeof sourceOrSourceId === 'string' ? sourceOrSourceId :
      'data' in sourceOrSourceId ? sourceOrSourceId.id :
      `iiif:${sourceOrSourceId.id}`;

    const normalizedId = _normalizeSourceId(id);
      
    const source = _findSource(normalizedId);
    if (source) {
      const all = await getAnnotations(normalizedId);
      const next = all.filter(a => a.id !== annotation.id);

      cachedAnnotations.set(normalizedId, next);

      const fileHandle = await getAnnotationsFile(source);
      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      reject(Error(`Image ${normalizedId} not found`));
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
    const getCanvas = (annotation: W3CAnnotation, manifest: IIIFManifestResource) => {
      const targetSource = Array.isArray(annotation.target) ? annotation.target[0] : annotation.target;
      const [_, canvasId] = parseIIIFId(targetSource.source);
      const { canvases } = (manifest as IIIFManifestResource);
      return canvases.find(c => c.id === canvasId);
    }

    // Let's try cached anntoations first
    for (const [sourceId, annotations] of cachedAnnotations.entries()) {
      const found = annotations.find(a => a.id === annotationId);
      if (found) {
        const source = _findSource(sourceId);
        if ('uri' in source) {
          return Promise.resolve([found, getCanvas(found, source as IIIFManifestResource)] as [W3CAnnotation, CanvasInformation]);
        } else {
          return Promise.resolve([found, source] as [W3CAnnotation, FileImage]);
        }
      }
    }

    // Not cached - not much we can do except go through all images we
    // haven't loaded yet.
    const cachedIds = new Set([...cachedAnnotations.keys()]);

    const uncachedSources = [
      ...images.filter(i => !cachedIds.has(i.id)),
      ...iiifResources.filter(r => !cachedIds.has(`iiif:${r.id}`))
    ];

    return uncachedSources.reduce<Promise<[W3CAnnotation, FileImage | CanvasInformation] | undefined>>((promise, source) => promise.then(result => {
      if (result) return result; // Skip

      const id = 'file' in source ? source.id : `iiif:${source.id}`;

      // Load annotations for this source
      return getAnnotations(id).then(annotations => {
        const found = annotations.find(a => a.id === annotationId);
        if (found) {
          if ('uri' in source) {
            return [found, getCanvas(found, source as IIIFManifestResource)];
          } else {
            return [found, source] as [W3CAnnotation, FileImage];
          }
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

  const _getAnnotations = (
    sourceId: string,
    opts: { type: 'image' | 'metadata' | 'both' } = { type: 'both' }
  ): Promise<W3CAnnotation[]> => new Promise(async resolve => {
    const filterByOpts = (annotations: W3CAnnotation[]) =>
      opts.type === 'image' ? annotations.filter(a => hasSelector(a))  :
      opts.type === 'metadata' ? annotations.filter(a => !hasSelector(a)) :
      annotations;

    const normalizedId = _normalizeSourceId(sourceId);
    const cached = cachedAnnotations.get(normalizedId);
    if (cached) {
      // A precaution. The data model could have changed meanwhile
      const repaired = repairAnnotations(cached, datamodel);
      cachedAnnotations.set(normalizedId, repaired);
      resolve(filterByOpts(repaired));
    } else {
      const readFile = (handle: FileSystemFileHandle): Promise<W3CAnnotation[]> => 
        handle.getFile().then(file =>
          readJSONFile<W3CAnnotation[]>(file)
            .then(data => {
              const annotations = repairAnnotations(data || [], datamodel);
              cachedAnnotations.set(normalizedId, annotations);
              return filterByOpts(annotations);
            })
            .catch(() => {
              cachedAnnotations.set(normalizedId, []);
              return [];
            }));

      const source = _findSource(normalizedId);
      if (source) {
        const fileHandle = await getAnnotationsFile(source);
        readFile(fileHandle).then(annotations => {
          resolve(annotations);
        });
      } else {
        console.warn(`Image ${normalizedId} not found`);
        resolve([]);
      }
    }
  });

  const getAnnotations = (
    sourceId: string,
    opts: { type: 'image' | 'metadata' | 'both' } = { type: 'both' }
  ) => {
    if (sourceId.startsWith('iiif:')) {
      const [manifestId, canvasId] = parseIIIFId(sourceId);
      if (canvasId) {
        return getCanvasAnnotations(sourceId, opts);  
      } else {
        return getManifestAnnotations(manifestId, opts);
      }
    } else {
      return _getAnnotations(sourceId, opts);
    }
  }

  const getManifestAnnotations = (
    manifestId: string,
    opts: { type: 'image' | 'metadata' | 'both' } = { type: 'both' }
  ) => {
    return _getAnnotations(`iiif:${manifestId}`, opts).then(annotations => {
      return annotations.filter(a => !Array.isArray(a.target) && a.target.source === `iiif:${manifestId}`)
    });
  }

  const getCanvas = (id: string) => {
    const [manifestId, canvasId] = parseIIIFId(id);
    if (manifestId && canvasId) {
      const manifest = iiifResources.find(r => r.id === manifestId) as IIIFManifestResource;
      return manifest.canvases.find(c => c.id === canvasId);
    }
  }

  const getCanvasAnnotations = (
    id: string,
    opts: { type: 'image' | 'metadata' | 'both' } = { type: 'both' }
  ) => {
    const [manifestId, canvasId] = parseIIIFId(id);
    return _getAnnotations(`iiif:${manifestId}`, opts).then(annotations => {
      return canvasId 
        ? annotations.filter(a => !Array.isArray(a.target) && a.target.source === id)
        : annotations;
    })
  }

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

  const getIIIFResource = (id: string) => iiifResources.find(r => r.id === id);

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

  const removeIIIFResource = async (resource: IIIFResource) => {
    const handle = resource.folder;

    try {
      await handle.removeEntry(`_iiif.${resource.id}.annotations.json`);
    } catch {
      // Could fail in case there are no annotations yet - ignore
    }

    await handle.removeEntry(`_iiif.${resource.id}.json`);

    // Remove from store
    const toRemove = iiifResources.findIndex(r => r.id === resource.id);
    iiifResources.splice(toRemove, 1);
  }

  const importIIIFResource = (
    info: IIIFResourceInformation, 
    folderId?: string
  ) => new Promise<IIIFResource>(async (resolve, reject) => {
    const folder = folderId ? getFolder(folderId) : getRootFolder();
    if (!folder) {
      console.error(`Cannot import IIIF - unknown folder: ${folderId}`);
      reject();
    } else {
      const filename = `_iiif.${info.id}.json`;

      // Don't import the same manifest twice into the same folder
      try {
        await folder.handle.getFileHandle(filename, { create: false });
        reject(new Error('IIIF resource already exists in this folder'));
        return;
      } catch {
        const handle = await folder.handle.getFileHandle(filename, { create: true });

        await writeJSONFile(handle, info);

        const resource: IIIFResource = {
          folder: folder.handle,
          path: folder.path,
          ...info
        }

        iiifResources.push(resource);
        resolve(resource);
      }
    }
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
  ): Promise<LoadedFileImage> => new Promise((resolve, reject) => {
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
    sourceId: string, 
    annotation: W3CAnnotation
  ): Promise<W3CAnnotation[]> => new Promise(async (resolve, reject) => {
    // Strip image hash, if any
    const normalizedId = _normalizeSourceId(sourceId);
    const source = _findSource(normalizedId);
    if (source) {
      const annotations = await getAnnotations(normalizedId);

      const exists = annotations.find(a => a.id === annotation.id);
      const next = exists ? 
        annotations.map(a => a.id === annotation.id ? annotation : a) :
        [...annotations, annotation];

      cachedAnnotations.set(normalizedId, next);
      resolve(next);
    } else {
      reject(Error(`Image ${normalizedId} not found`));
    }
  });

  const upsertAnnotation = (
    sourceId: string, 
    annotation: W3CAnnotation
  ): Promise<void> => _upsertOneAnnotation(
    sourceId,
    annotation
  ).then(next => new Promise(async (resolve, reject) => {
    const source = _findSource(sourceId);
    if (source) {
      const fileHandle = await getAnnotationsFile(source);
      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      // Should never happen
      reject(Error(`Image ${sourceId} not found`));
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
    iiifResources,
    images,
    bulkDeleteAnnotations,
    bulkUpsertAnnotation,
    countAnnotations,
    deleteAnnotation,
    findAnnotation,
    findImageForAnnotation,
    getAnnotations,
    getCanvas,
    getCanvasAnnotations,
    getDataModel,
    getFolder,
    getFolderContents,
    getFolderMetadata,
    getIIIFResource,
    getImage,
    getImageMetadata,
    getRootFolder,
    importIIIFResource,
    listImagesInFolder,
    loadImage,
    removeIIIFResource,
    upsertAnnotation,
    upsertFolderMetadata,
    upsertImageMetadata
  }

  const relations = await loadRelationStore(rootDir, store);
  
  resolve({...store, ...relations });

});
 