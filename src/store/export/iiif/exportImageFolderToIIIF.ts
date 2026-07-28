import { Folder } from '@/model';
import { Store } from '@/store';

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
  console.log('[TODO] exporting folder', folder);
}

/**
 * A helper method to determine whether the folder meets
 * the requirements and limitations of `exportImageFolderToIIIF`.
 */
export const canExportFolderAsIIIF = (folder: Folder, store: Store) => {
  const { images, folders, iiifResources } = store.getFolderContents(folder.handle);
  return folders.length === 0 && iiifResources.length === 0 && images.length > 0;
}
 