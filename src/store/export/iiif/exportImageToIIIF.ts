import JSZip from 'jszip';
import { LoadedFileImage } from '@/model';
import { Store } from '@/store';
import { crosswalkAnnotations } from './crosswalkAnnotations';

// Helper
export const stripExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

// Helper: determines width + height for the given image file blob
const getImageDimensions = (blob: Blob): Promise<{ width: number, height: number }> => 
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });

const createAnnotationPage = (image: LoadedFileImage, baseUrl: string, store: Store) => {
  const base = `${baseUrl}/${stripExtension(image.name)}`;

  return store.getAnnotations(image.id, { type: 'image' }).then(annotations => ({
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: `${base}/annotations.json`,
    type: 'AnnotationPage',
    items: crosswalkAnnotations(annotations, store)
  }));
}

/**
 * Creates a basic IIIF manifest for the file image, according to IIIF cookbook recipe 1:
 * https://iiif.io/api/cookbook/recipe/0001-mvm-image/
 */
const createStaticManifest = (image: LoadedFileImage, baseUrl: string) => {
  const base = `${baseUrl}/${stripExtension(image.name)}`;

  return getImageDimensions(image.data).then(({ width, height }) => ({
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: `${base}/manifest.json`,
    type: 'Manifest',
    label: { en: [ image.name ] },
    items: [{
      id: `${base}/canvas/1`,
      type: 'Canvas',
      height,
      width,
      items: [{
        id: `${base}/page/p1/1`,
        type: 'AnnotationPage',
        items: [{
          id: `${base}/annotation/p0001-image`,
          type: 'Annotation',
          motivation: 'painting',
          body: {
            id: `${base}/${image.name}`,
            type: 'Image',
            height,
            width
          },
          target: `${base}/canvas/1`
        }]
      }],
      annotations: [{
        id: `${base}/annotations.json`,
        type: 'AnnotationPage'
      }]
    }]
  }));
}

/**
 * Exports a ready-to-deploy IIIF ZIP package:
 * - The image file
 * - A static image presentation manifest
 * - A JSON-LD annotation list
 */
export const exportImageToIIIF = async (image: LoadedFileImage, baseUrl: string, store: Store) => {
  const name = stripExtension(image.name);

  const zip = new JSZip();

  zip.file(`${name}/${image.name}`, image.data, { binary: true });

  const manifest = await createStaticManifest(image, baseUrl);
  zip.file(`${name}/manifest.json`, JSON.stringify(manifest, null, 2));

  const annotations = await createAnnotationPage(image, baseUrl, store);
  zip.file(`${name}/annotations.json`, JSON.stringify(annotations, null, 2));

  const blob = await zip.generateAsync({ type:'blob' });

  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${name}.zip`;
  anchor.click();
}