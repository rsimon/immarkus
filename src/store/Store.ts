import { W3CAnnotation } from '@annotorious/react';
import { Image } from '@/model';
import { VocabularyStore, loadVocabulary } from '@/store/VocabularyStore';
import { generateShortId, readImageFile, readJSONFile, writeJSONFile } from '@/store/utils';

export interface Store extends VocabularyStore {

  handle: FileSystemDirectoryHandle;

  images: Image[];

  getImage(id: string): Image | undefined;

  getAnnotations(imageId: string): W3CAnnotation[];

  countAnnotations(imageId: string, withSelectorOnly?: boolean): number;

  upsertAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  deleteAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

}

export type StoreProgressHandler = (progress: number) => void;

const loadDirectory = async (handle: FileSystemDirectoryHandle, files: File[] = []): Promise<File[]> => {

  for await (const entry of handle.values()) {
    try {
      if (entry.kind === 'directory') {
        // Wait for subfolder contents to load
        // bconsole.info(`Found directory: ${handle.name}/${entry.name}`);
        const subDirHandle = await handle.getDirectoryHandle(entry.name);
        await loadDirectory(subDirHandle, files);
      } else {
        // console.info(`Found file: ${handle.name}/${entry.name}`);
        const fileHandle = await handle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        files.push(file);
      }
    } catch (error) {
      console.error('Error opening fs entry', error);
    }
  }

  return files;

}

export const loadStore = (handle: FileSystemDirectoryHandle, onProgress?: StoreProgressHandler): Promise<Store> => 
 
  new Promise(async resolve => {
    // console.info('Starting import: ' + handle.name);

    const files = await loadDirectory(handle);

    const images: Image[] = [];

    const annotations = new Map<string, W3CAnnotation[]>();

    const vocabulary = await loadVocabulary(handle);

    // console.info(`Attempting import of ${files.length} files`);
    // files.forEach(f => console.info(`  ${f.name}`));

    await files.reduce((promise, file, index) => {
      let nextPromise;

      if (file.type.startsWith('image')) {
        // Load the image and attach it to the images array
        console.info(`Image: ${file.name}`);

        nextPromise = promise.then(() => readImageFile(file).then(data => {
          const { name } = file;
          const path = `${handle!.name}/${name}`;
          
          return generateShortId(path).then(id => {
            images.push({ id, name, path, data });
            // console.info(`${name} - OK (image file)`);
          });
        }));
      } else if (file.type === 'application/json') {
        nextPromise = promise.then(() => readJSONFile<W3CAnnotation[]>(file).then(json => {
          console.info(`Annotations: ${file.name}`);

          const { name } = file;
          const path = `${handle!.name}/${name}`;

          return generateShortId(path).then(id => {
            annotations.set(id, json);
            // console.info(`${name} - OK (annotations file)`);
          });
        }));
      } else {
        console.info(`Skipping: ${file.name}`);
        nextPromise = promise;
      }

      onProgress && onProgress(Math.round(100 * index / files.length));

      return nextPromise;
    }, Promise.resolve());

    onProgress && onProgress(100);

    console.info(`Finished loading. Got ${images.length} images`);

    const getAnnotationFileName = (imageId: string) => {
      const image = images.find(i => i.id === imageId);
      if (!image)
        throw 'Attempt to store data for unknown image: ' + imageId;

      const { name } = image;
      return `${name.substring(0, name.lastIndexOf('.'))}.json`;
    }

    const getImage = (id: string) => images.find(i => i.id === id);

    const getAnnotations = (imageId: string) => annotations.get(imageId) || [];

    const countAnnotations = (imageId: string, withSelectorOnly = true) => 
      withSelectorOnly ?
        // @ts-ignore
        (annotations.get(imageId) || []).filter(a => a.target.selector).length || 0 :
         annotations.get(imageId)?.length || 0;

    const upsertAnnotation = (imageId: string, annotation: W3CAnnotation) => 
      handle.getFileHandle(getAnnotationFileName(imageId), { create: true }).then(fileHandle => {
        const exists = annotations.get(imageId)?.find(a => a.id === annotation.id);

        const next = exists ? 
          // Update existing
          annotations.get(imageId).map(a => a.id === annotation.id ? annotation : a) :

          // Append
          [...(annotations.get(imageId) || []), annotation];

        annotations.set(imageId, next);

        writeJSONFile(fileHandle, next);
      });
  
    const deleteAnnotation = (imageId: string, annotation: W3CAnnotation) =>
      handle.getFileHandle(getAnnotationFileName(imageId), { create: true }).then(fileHandle => {
        const next = (annotations.get(imageId) || [])
          .filter(a => a.id !== annotation.id);

        annotations.set(imageId, next);

        writeJSONFile(fileHandle, next);
      }); 

    resolve({
      handle,
      images: [...images],
      getImage,
      getAnnotations,
      countAnnotations,
      upsertAnnotation,
      deleteAnnotation,
      ...vocabulary
    });
  
  });

