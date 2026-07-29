import JSZip from 'jszip';
import { FileImage, LoadedFileImage } from '@/model';
import { getImageMetadata, Store } from '@/store';
import { getSourceParents } from '@/utils/metadata';
import { crosswalkAnnotations } from './crosswalkAnnotations';
import { crosswalkMetadata, getFlattenedParentFolderMetadata } from './crosswalkMetadata';
import { IIIFMetadataField } from './types';

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

export const createAnnotationPage = (
  image: FileImage, 
  id: string, 
  targetId: string,
  miradorSafe: boolean, 
  store: Store
) => {
  return store.getAnnotations(image.id, { type: 'image' }).then(annotations => ({
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id,
    type: 'AnnotationPage',
    items: crosswalkAnnotations(annotations, miradorSafe, store, targetId)
  }));
}

export const createStaticImageCanvas = async (
  image: LoadedFileImage, 
  base: string,
  label?: string,
  metadata: IIIFMetadataField[] = [],
  canvasIndex = 1,
  filename = 'annotations.json'
) => {
  const { width, height } = await getImageDimensions(image.data);

  return {
    id: `${base}/canvas/${canvasIndex}`,
    type: 'Canvas',
    ...(metadata.length > 0 ? { metadata } : {}),
    height,
    width,
    ...(label ? { label: { en: [label] } } : {}),
    items: [{
      id: `${base}/page/p${canvasIndex}/1`,
      type: 'AnnotationPage',
      items: [{
        id: `${base}/annotation/p${canvasIndex}-image`,
        type: 'Annotation',
        motivation: 'painting',
        body: {
          id: `${base}/${image.name}`,
          type: 'Image',
          height,
          width
        },
        target: `${base}/canvas/${canvasIndex}`
      }]
    }],
    annotations: [{
      id: `${base}/${filename}`,
      type: 'AnnotationPage'
    }]
  }
}

/**
 * Creates a basic IIIF manifest for the file image, according to IIIF cookbook recipe 1:
 * https://iiif.io/api/cookbook/recipe/0001-mvm-image/
 */
const createStaticManifest = async (image: LoadedFileImage, baseUrl: string, store: Store) => {
  const base = `${baseUrl}/${stripExtension(image.name)}`;

  // Folder metadata -> manifest metadata
  const folders = getSourceParents(image.id, store);
  const folderMetadata = await getFlattenedParentFolderMetadata(folders, store);

  // Image metadata -> canvas metadata
  const { metadata: imageMetaBody } = await getImageMetadata(store, image.id);
  const imageMetadata = imageMetaBody && Object.keys(imageMetaBody).length > 0 
    ? crosswalkMetadata(imageMetaBody, store, 'IMAGE') : [];

  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: `${base}/manifest.json`,
    type: 'Manifest',
    label: { en: [ image.name ] },
    ...(
      folderMetadata.length > 0 ? { metadata: folderMetadata } : 
      // If ONLY image metadata -> add as manifest metadata
      imageMetadata.length > 0 ? { metadata: imageMetadata } : {}
    ),
    items: [
      await createStaticImageCanvas(
        image,
        base,
        undefined,
        imageMetadata.length > 0 && folderMetadata.length > 0 ? imageMetadata : []
      )
    ]
  }
}

/**
 * Exports a ready-to-deploy IIIF ZIP package:
 * - The image file
 * - A static image presentation manifest
 * - A JSON-LD annotation list
 */
export const exportImageToIIIF = async (image: LoadedFileImage, baseUrl: string, miradorSafe: boolean, store: Store) => {
  const name = stripExtension(image.name);

  const zip = new JSZip();

  zip.file(`${name}/${image.name}`, image.data, { binary: true });

  const manifest = await createStaticManifest(image, baseUrl, store);
  zip.file(`${name}/manifest.json`, JSON.stringify(manifest, null, 2));

  const base = `${baseUrl}/${name}`;
  const annotations = await createAnnotationPage(
    image, 
    `${base}/annotations.json`, 
    `${base}/canvas/1`, 
    miradorSafe,
    store);

  zip.file(`${name}/annotations.json`, JSON.stringify(annotations, null, 2));

  const blob = await zip.generateAsync({ type:'blob' });

  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${name}.zip`;
  anchor.click();
}