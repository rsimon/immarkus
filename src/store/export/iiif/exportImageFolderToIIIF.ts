import JSZip from 'jszip';
import { Folder, LoadedFileImage } from '@/model';
import { getImageMetadata, Store } from '@/store';
import { createAnnotationPage, createStaticImageCanvas, stripExtension } from './exportImageToIIIF';
import { crosswalkMetadata, IIIFMetadataField } from './crosswalkMetadata';

/**
 * Creates a basic IIIF manifest for the list of image files, according to 
 * IIIF cookbook recipe 1:
 * 
 * https://iiif.io/api/cookbook/recipe/0001-mvm-image/
 */
const createStaticManifest = async (folder: Folder, images: LoadedFileImage[], base: string, store: Store) => {
  // Folder metadata -> manifest metadata
  // const folderMetadata = await getFlattenedParentFolderMetadata(store, image.id);

  const resolveImageMetadata = async (image: LoadedFileImage): Promise<IIIFMetadataField[]> => {
    const { metadata: imageMetaBody } = await getImageMetadata(store, image.id);
    return imageMetaBody && Object.keys(imageMetaBody).length > 0 
      ? crosswalkMetadata(imageMetaBody, store, 'IMAGE') : [];
  } 

  const items = await Promise.all(
    images.map(async image => {
      const metadata = await resolveImageMetadata(image);
      return createStaticImageCanvas(image, metadata, base);
    })
  );

  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: `${base}/manifest.json`,
    type: 'Manifest',
    label: { en: [ folder.name ] },
    // TODO folder + parent folder metadata 
    items
  }
}

/**
 * Exports a ready-to-deploy IIIF ZIP package for a folder that 
 * contains ONLY IMAGES AND NO SUB-FOLDERS.
 * 
 * Zip contains:
 * - The image files
 * - A presentation API v3 manifest with one static image canvas for each image
 * - One JSON-LD annotation list for each image
 */
export const exportImageFolderToIIIF = async (folder: Folder, baseUrl: string, miradorSafe: boolean, store: Store) => {
  const base = `${baseUrl}/${folder.id}`;

  const zip = new JSZip();

  const { images } = store.getFolderContents(folder.handle);
  const loadedImages = await Promise.all(images.map(i => store.loadImage(i.id)));

  // Package image files
  loadedImages.forEach(image => {
    zip.file(`${folder.id}/${image.name}`, image.data, { binary: true });
  });

  // Package annotation lists
  const annotationPages = await Promise.all(images.map(i => 
    createAnnotationPage(i, base, miradorSafe, store)));

  annotationPages.forEach((annotations, idx) =>
    zip.file(`${folder.id}/${stripExtension(images[idx].name)}.json`, JSON.stringify(annotations, null, 2)));

  // Package manifest
  const manifest = await createStaticManifest(folder, loadedImages, base, store);
  zip.file(`${folder.id}/manifest.json`, JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type:'blob' });

  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${folder.id}.zip`;
  anchor.click();
}

/**
 * A helper method to determine whether the folder meets
 * the requirements and limitations of `exportImageFolderToIIIF`.
 */
export const canExportFolderAsIIIF = (folder: Folder, store: Store) => {
  const { images, folders, iiifResources } = store.getFolderContents(folder.handle);
  return folders.length === 0 && iiifResources.length === 0 && images.length > 0;
}
 