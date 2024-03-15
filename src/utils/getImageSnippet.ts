import { ImageAnnotation, W3CImageAnnotation, W3CImageFormat } from '@annotorious/annotorious';
import { Image, LoadedImage } from '@/model';
import { Store } from '@/store';

export interface ImageSnippet {

  annotation: ImageAnnotation;

  height: number;

  width: number;

  data: Uint8Array;

}

const cropImage = async (
  image: LoadedImage, 
  annotation: ImageAnnotation
) => new Promise<ImageSnippet>((resolve, reject) => setTimeout(() => {
  const { bounds } = annotation.target.selector.geometry;

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
        const data = new Uint8Array(reader.result as ArrayBuffer);

        resolve({
          annotation,
          height: bounds.maxY - bounds.minY,
          width: bounds.maxX - bounds.minX,
          data
        });
      }

      reader.readAsArrayBuffer(blob);
    }, 'image/jpg'); 
  };

  img.onerror = error => reject(error);

  img.src = URL.createObjectURL(image.data);
}, 100));

export const getImageSnippet = (
  image: LoadedImage, 
  annotation: W3CImageAnnotation
): Promise<ImageSnippet> => {
  const adapter = W3CImageFormat(image.name);
  const { parsed } = adapter.parse(annotation);

  if (!parsed)
    return Promise.reject('Failed to parse annotation');

  return cropImage(image, parsed);
}

export const getAnntotationsWithSnippets = (
  image: Image, 
  store: Store
): Promise<{ annotation: W3CImageAnnotation, snippet?: ImageSnippet }[]> =>
  store.loadImage(image.id).then(loaded =>
    store.getAnnotations(image.id, { type: 'image' }).then(annotations => 
      Promise.all(annotations.map(a => {
        const annotation = a as W3CImageAnnotation;
        return getImageSnippet(loaded, annotation)
          .then(snippet => ({ annotation, snippet }))
          .catch(() => ({ annotation }))
      }))
    )
  )