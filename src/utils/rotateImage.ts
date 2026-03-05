import Worker from './rotateImageWorker?worker';

export const rotateImage = (
  blob: Blob,
  rotation: number, // 0, 90, 180, 270
  format = 'image/jpeg'
) => new Promise<Blob>((resolve, reject) => {
  const worker = new Worker();

  const messageHandler = (e: MessageEvent) => {
    worker.removeEventListener('message', messageHandler);
    if (e.data.error) {
      reject(new Error(e.data.error));
    } else {
      const blob: Blob = e.data.blob;
      resolve(blob);
    }
  };

  worker.addEventListener('message', messageHandler);

  worker.postMessage({ blob, rotation, format });
});