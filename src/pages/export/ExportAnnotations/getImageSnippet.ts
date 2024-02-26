import { Bounds, W3CImageAnnotation, W3CImageFormat } from '@annotorious/annotorious';
import { LoadedImage } from '@/model';

export interface Snippet {

  height: number;

  width: number;

  data: Buffer;

}

const cropImage = async (image: LoadedImage, bounds: Bounds) =>
  new Promise<Snippet>((resolve, reject) => {
    const img = document.createElement('img');

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const width = bounds.maxX - bounds.minX;
      const height = bounds.maxY - bounds.minY;
      canvas.width = width;
      canvas.height = height;

      context.drawImage(img, bounds.minX, bounds.minY, width, height, 0, 0, width, height);

      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = new Uint8Array(reader.result as ArrayBuffer);

          const snippet: Snippet = {
            height: bounds.maxY - bounds.minY,
            width: bounds.maxX - bounds.minX,
            data: arrayBuffer as Buffer
          };

          resolve(snippet);
        }

        reader.readAsArrayBuffer(blob);
      }, 'image/png'); 
    };

    img.onerror = error => reject(error);

    img.src = URL.createObjectURL(image.data);
  });

export const getImageSnippet = (image: LoadedImage, annotation: W3CImageAnnotation) =>
  new Promise<Snippet>((resolve, reject) => {
    const adapter = W3CImageFormat(image.name);
    const { parsed } = adapter.parse(annotation);

    if (!parsed) {
      reject('Failed to parse annotation');
      return;
    }

    const bbox = parsed.target.selector.geometry.bounds;
    return cropImage(image, bbox)
      .then(snippet => resolve(snippet))
      .catch(error => reject(error));
  });