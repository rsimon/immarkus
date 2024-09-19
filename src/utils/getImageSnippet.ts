import { ImageAnnotation, W3CImageAnnotation, W3CImageFormat } from '@annotorious/react';
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

// Bit of an ad-hoc test...
const isW3C = (annotation: ImageAnnotation | W3CImageAnnotation): annotation is W3CImageAnnotation =>
  (annotation as W3CImageAnnotation).body !== undefined;

export const getImageSnippet = (
  image: LoadedImage, 
  annotation: ImageAnnotation | W3CImageAnnotation
): Promise<ImageSnippet> => {
  let a: ImageAnnotation;

  if (isW3C(annotation)) {
    const adapter = W3CImageFormat(image.name);
    const { parsed } = adapter.parse(annotation);
    if (!parsed)
      return Promise.reject('Failed to parse annotation');
    
    a = parsed;
  } else {
    a = annotation;
  }

  return cropImage(image, a);
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