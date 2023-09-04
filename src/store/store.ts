import { W3CAnnotation } from '@annotorious/react';
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

const readJSONFile = (file: File): Promise<W3CAnnotation[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const obj: W3CAnnotation[] = JSON.parse(String(event.target.result));
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

const writeJSONFile = (handle: FileSystemFileHandle, annotations: W3CAnnotation[]) => {
  const content = JSON.stringify(annotations, null, 2);
  return handle.createWritable().then(writable => {
    return writable.write(content).then(() => writable.close());
  });
}

const generateShortId = (filepath: string) => {
  const str = filepath.substring(0, filepath.lastIndexOf('.'));

  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
    .then(hash => {
      const arr = new Uint8Array(hash);
      const shortId = Array.from(arr)
        .slice(0, 8)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    
      return shortId;
    });
}

export interface Store {

  handle: FileSystemDirectoryHandle;

  images: Image[];

  getImage(id: string): Image | undefined;

  getAnnotations(imageId: string): W3CAnnotation[];

  countAnnotations(imageId: string): number;

  addAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  updateAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

  deleteAnnotation(imageId: string, annotation: W3CAnnotation): Promise<void>;

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

    const annotations = new Map<string, W3CAnnotation[]>()
  
    await files.reduce((promise, file, index) => {
      let nextPromise;

      if (file.type.startsWith('image')) {
        // Load the image and attach it to the images array
        nextPromise = promise.then(() => readImageFile(file).then(data => {
          const { name } = file;
          const path = `${handle!.name}/${name}`;
          
          return generateShortId(path).then(id => {
            images.push({ id, name, path, data });
          });
        }));
      } else if (file.type === 'application/json') {
        nextPromise = promise.then(() => readJSONFile(file).then(json => {
          const { name } = file;
          const path = `${handle!.name}/${name}`;

          return generateShortId(path).then(id => {
            annotations.set(id, json);
          });
        }));
      } else {
        nextPromise = promise;
      }

      onProgress && onProgress(Math.round(100 * index / files.length));

      return nextPromise;
    }, Promise.resolve());

    onProgress && onProgress(100);

    const getAnnotationFileName = (imageId: string) => {
      const image = images.find(i => i.id === imageId);
      if (!image)
        throw 'Attempt to store data for unknown image: ' + imageId;

      const { name } = image;
      return `${name.substring(0, name.lastIndexOf('.'))}.json`;
    }

    const getImage = (id: string) => images.find(i => i.id === id);

    const getAnnotations = (imageId: string) => annotations.get(imageId) || [];

    const countAnnotations = (imageId: string) => annotations.get(imageId)?.length || 0;

    const addAnnotation = (imageId: string, annotation: W3CAnnotation) =>
      handle.getFileHandle(getAnnotationFileName(imageId), { create: true }).then(fileHandle => {
        const next = [
          ...(annotations.get(imageId) || []).filter(a => a.id !== annotation.id),
          annotation
        ];

        annotations.set(imageId, next);

        writeJSONFile(fileHandle, next);
      });

    const updateAnnotation = (imageId: string, annotation: W3CAnnotation) =>
      handle.getFileHandle(getAnnotationFileName(imageId), { create: true }).then(fileHandle => {
        const next = (annotations.get(imageId) || [])
          .map(a => a.id === annotation.id ? annotation : a);

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
      addAnnotation,
      updateAnnotation,
      deleteAnnotation
    });
  
  });

