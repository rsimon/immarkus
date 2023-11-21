import { W3CAnnotation } from '@annotorious/react';
import { Folder, FolderItems, Image, LoadedImage } from '@/model';
import { generateShortId, readImageFile, readJSONFile, writeJSONFile } from './utils';
import { loadVocabulary, VocabularyStore } from './VocabularyStore';

export interface Store extends VocabularyStore {

  rootDir: FileSystemDirectoryHandle;

  images: Image[];

  folders: Folder[];

  countAnnotations(imageId: string, withSelectorOnly?: boolean): Promise<number>;

  deleteAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  getAnnotations(imageId: string): Promise<W3CAnnotation[]>;

  getDirContents(dir: FileSystemDirectoryHandle): FolderItems;

  loadImage(id: string): Promise<LoadedImage>;

  upsertAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

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
        const p = [...path, name ];
        
        folders.push({ name, path: p, handle: subDirHandle, parent: dirHandle });

        await loadDirectory(subDirHandle, p, images, folders);
      } else {
        const fileHandle = await dirHandle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();

        if (file.type.startsWith('image')) {
          const { name } = file;
          const id = await generateShortId(`${path.join('/')}/${name}`);

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

  const vocabulary = await loadVocabulary(rootDir);

  const cachedAnnotations = new Map<string, W3CAnnotation[]>();

  const getAnnotations = (
    imageId: string
  ): Promise<W3CAnnotation[]> => new Promise((resolve, reject) => {
    const cached = cachedAnnotations.get(imageId);
    if (cached) {
      resolve(cached);
    } else {
      const image = images.find(i => i.id === imageId);
      if (image) {
        readJSONFile<W3CAnnotation[]>(image.file)
          .then(annotations => {
            cachedAnnotations.set(imageId, annotations);
            resolve(annotations);
          })
          .catch(error => {
            cachedAnnotations.set(imageId, []);
            resolve([]);
          });
      } else {
        reject(Error(`Image ${imageId} not found`));
      }
    }
  });

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
      const filename = `${img.name.substring(0, img.name.lastIndexOf('.'))}.json`;

      const annotations = await getAnnotations(imageId);
      const fileHandle = await img.folder.getFileHandle(filename, { create: true });
      
      const next = annotations.filter(a => a.id !== annotation.id);

      cachedAnnotations.set(imageId, next);

      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      reject(Error(`Image ${imageId} not found`));
    }
  });

  const getDirContents = (dir: FileSystemDirectoryHandle): FolderItems => {
    const imageItems = images.filter(i => i.folder === dir);
    const folderItems = folders.filter(f => f.parent === dir);
    return { images: imageItems, folders: folderItems };
  }

  const loadImage = (
    id: string
  ): Promise<LoadedImage> => new Promise((resolve, reject) => {
    const img = images.find(i => i.id === id);
    if (img) {
      readImageFile(img.file).then(data => {
        resolve({...img, data });
      });
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
      const filename = `${img.name.substring(0, img.name.lastIndexOf('.'))}.json`;

      const annotations = await getAnnotations(imageId);
      const fileHandle = await img.folder.getFileHandle(filename, { create: true });

      const exists = annotations.find(a => a.id === annotation.id);
      const next = exists ? 
        annotations.map(a => a.id === annotation.id ? annotation : a) :
        [...annotations, annotation];
      
      cachedAnnotations.set(imageId, next);

      await writeJSONFile(fileHandle, next);
      resolve();
    } else {
      reject(Error(`Image ${imageId} not found`));
    }
  });

  resolve({
    rootDir,
    images,
    folders,
    countAnnotations,
    deleteAnnotation,
    getAnnotations,
    getDirContents,
    loadImage,
    upsertAnnotation,
    ...vocabulary
  });

});
 