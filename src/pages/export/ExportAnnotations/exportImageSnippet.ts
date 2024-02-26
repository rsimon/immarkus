import { Bounds, W3CImageAnnotation, W3CImageFormat } from '@annotorious/annotorious';
import { LoadedImage } from '@/model';
import { Store } from '@/store';

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

export const exportImageSnippet = (store: Store) => {
  const dummyImage = store.images[0];

  store.loadImage(dummyImage.id).then(image => {
    store.getAnnotations(dummyImage.id).then(annotations => {
      const dummyAnnotation = annotations[0] as W3CImageAnnotation;

      const adapter = W3CImageFormat(image.name);

      const { parsed } = adapter.parse(dummyAnnotation);

      image.data

      const bbox = parsed.target.selector.geometry.bounds;

      cropImage(image, bbox);
    });
  });
}