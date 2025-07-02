import { W3CAnnotation } from '@annotorious/react';

export const readImageFile = (file: File): Promise<Blob> =>
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

export const readJSONFile = <T extends unknown>(file: File): Promise<T | undefined> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const obj: T = JSON.parse(String(event.target.result));
        resolve(obj);
      } else {
        resolve(undefined);
      }
    }

    reader.onerror = (event) => {
      reject(event.target?.error);
    };

    reader.readAsText(file);
  });

let pendingWrite = null;

let isWriting = false;

export const writeJSONFile = (handle: FileSystemFileHandle, data: any) => {  
  const performWrite = () => {
    if (!pendingWrite) return Promise.resolve();
    
    const { handle, data } = pendingWrite;

    pendingWrite = null;

    isWriting = true;
    
    const content = JSON.stringify(data, null, 2);

    return handle.createWritable().then(writable => {
      writable.write(content).then(() => writable.close())
    }).catch(error => {
      console.error('Error writing file: ', error);
    }).finally(() => {
      isWriting = false;

      if (pendingWrite) performWrite();
    });
  };

  pendingWrite = { handle, data };

  if (!isWriting)
    return performWrite();

  return Promise.resolve();
}

export const generateShortId = (str: string) => {
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

export const fileExistsInDirectory = async (
  dirHandle: FileSystemDirectoryHandle,
  filename: string
): Promise<boolean> => {
  try {
    await dirHandle.getFileHandle(filename);
    return true;
  } catch (error) {
    // File doesn't exist
    return false;
  }
};

/**
 * Note that the FileSystem API does not seem to include a method
 * to simply rename a file directly. Therefore, we have to write a
 * new file, and delete the old one.
 */
export const renameFile = async (
  dirHandle: FileSystemDirectoryHandle,
  oldFilename: string,
  newFilename: string
): Promise<void> => {
  try {
    const oldFileHandle = await dirHandle.getFileHandle(oldFilename);

    // Read old file
    const oldFile = await oldFileHandle.getFile();
    const content = await oldFile.arrayBuffer();
    
    const newFile = await dirHandle.getFileHandle(newFilename, { create: true });
    const writable = await newFile.createWritable();
    
    await writable.write(content);
    await writable.close();
    
    // Remove the original file
    await dirHandle.removeEntry(oldFilename);
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
}

export const hasSelector = (annotation: W3CAnnotation) => {
  if (!annotation.target)
    return false;

  const targets = Array.isArray(annotation.target) ? annotation.target : [annotation.target]
  return targets.some(t => t.selector);
}


