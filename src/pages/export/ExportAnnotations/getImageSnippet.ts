import { Bounds, W3CImageAnnotation, W3CImageFormat } from '@annotorious/annotorious';
import { LoadedImage } from '@/model';

const cropImage = async (image: LoadedImage, bounds: Bounds): Promise<Buffer> =>
  new Promise<Buffer>((resolve, reject) => {
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

      const dataURL = canvas.toDataURL();
      const buffer = Buffer.from(dataURL.split(',')[1], 'base64'); // Convert data URL to Buffer

      resolve(buffer);
    };

    img.onerror = error => reject(error);

    img.src = URL.createObjectURL(image.data);
  });

export const getImageSnippet = (image: LoadedImage, annotation: W3CImageAnnotation): Promise<Buffer> =>
  new Promise<Buffer>((resolve, reject) => {
    const adapter = W3CImageFormat(image.name);
    const { parsed } = adapter.parse(annotation);

    if (!parsed) {
      reject('Failed to parse annotation');
      return;
    }

    const bbox = parsed.target.selector.geometry.bounds;
    return cropImage(image, bbox)
      .then(buffer => resolve(buffer))
      .catch(error => reject(error));
  });