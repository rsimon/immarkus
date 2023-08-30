import { Annotation } from '@annotorious/react';
import { Image } from '@/model';

const readImageFile = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const contentArrayBuffer = event.target?.result as ArrayBuffer;
      const data = new Blob([contentArrayBuffer], { type: file.type });
      resolve(data);
    };

    reader.onerror = (event) => {
      reject(event.target?.error);
    };

    reader.readAsArrayBuffer(file);
  });

const readJSONFile = (file: File): Promise<Object[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const obj: Object[] = JSON.parse(String(event.target.result));
        resolve(obj);
      } else {
        reject();
      }
    }

    reader.onerror = (event) => {
      reject(event.target?.error);
    };

    reader.readAsText(file);
  });

const generateShortId = (str: string) =>
  crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
    .then(hash => {
      const arr = new Uint8Array(hash);
      const shortId = Array.from(arr)
        .slice(0, 8)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    
      return shortId;
    });

export interface Store {

  handle: FileSystemDirectoryHandle;

  images: Image[];

  getImage(id: string): Image | undefined;

  getAnnotations(imageId: string): Annotation[];

  countAnnotations(imageId: string): number;

  addAnnotation(imageId: string, annotation: Annotation): void;

  updateAnnotation(annotation: Annotation): void;

  deleteAnnotation(annotation: Annotation): void;

}

export type ProgressHandler = (progress: number) => void;

export const loadStore = (handle: FileSystemDirectoryHandle, onProgress?: ProgressHandler): Promise<Store> => 
  new Promise(async resolve => {
    const files = [];

    for await (const entry of handle.values()) {
      const fileHandle = await handle.getFileHandle(entry.name);
      const file = await fileHandle.getFile();
      files.push(file);
    }
  
    const images: Image[] = [];

    const annotations = new Map<string, Object[]>()
  
    await files.reduce((promise, file, index) => {
      let nextPromise;

      if (file.type.startsWith('image')) {
        // Load the image and attach it to the images array
        nextPromise = promise.then(() => readImageFile(file).then(data => {
          const { name } = file;
          const path = `${handle!.name}/${name}`;
          
          return generateShortId(path).then(id => {
            images.push({ id, name, path, data });
          })
        }));
      } else if (file.type === 'application/json') {
        nextPromise = promise.then(() => readJSONFile(file).then(json => {
          annotations.set(file.name, json);
        }));
      } else {
        nextPromise = promise;
      }

      onProgress && onProgress(Math.round(100 * index / files.length));

      return nextPromise;
    }, Promise.resolve());

    console.log('images', images);
    console.log('annotations', annotations);

    onProgress && onProgress(100);

    const getImage = (id: string) => images.find(i => i.id === id);

    const getAnnotations = (imageId: string) => annotations.get(imageId) as Annotation[];

    const countAnnotations = (imageId: string) => annotations.get(imageId)?.length || 0;

    const addAnnotation = (imageId: string, annotation: Annotation) => {

    }

    const updateAnnotation = (annotation: Annotation) => {
      
    }
  
    const deleteAnnotation = (annotation: Annotation)=> {
      
    }

    resolve({
      handle,
      images: [...images],
      getImage,
      getAnnotations,
      countAnnotations,
      addAnnotation,
      updateAnnotation,
      deleteAnnotation
    });
  
  });

