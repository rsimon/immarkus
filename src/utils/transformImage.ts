import Worker from './transformImageWorker?worker';
import type { Region } from '@/services';

export const transformImage = (
  blob: Blob,
  rotation: number,
  flipped: boolean = false,
  format = 'image/jpeg',
  crop?: Region
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

  worker.postMessage({ blob, rotation, flipped, format, crop });
});