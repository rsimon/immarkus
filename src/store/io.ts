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

export const writeJSONFile = (handle: FileSystemFileHandle, data: any) => {
  const content = JSON.stringify(data, null, 2);
  return handle.createWritable().then(writable => {
    return writable.write(content).then(() => writable.close());
  });
}
