import JSZip from 'jszip';
import { FileImage, Folder, LoadedFileImage } from '@/model';
import { getImageMetadata, Store } from '@/store';
import { createAnnotationPage, createStaticImageCanvas, stripExtension } from './exportImageToIIIF';
import { crosswalkMetadata, getFlattenedParentFolderMetadata } from './crosswalkMetadata';
import { getParentFolderHierarchy } from '@/utils/metadata';
import { FlattenedImage, FolderTree, IIIFMetadataField } from './types';
import { buildFolderTree, buildRanges } from './crosswalkFolderStructure';

const flattenImageRefs = (node: FolderTree): { image: FileImage, dir: string }[] => [
  ...node.images.map(image => ({ image, dir: node.relPath.length > 0 ? `${node.relPath.join('/')}/` : '' })),
  ...node.children.flatMap(flattenImageRefs)
];

/** Loads the actual image data for every image in the tree, preserving traversal order **/
const loadFlattenedImages = async (tree: FolderTree, store: Store): Promise<FlattenedImage[]> => {
  const refs = flattenImageRefs(tree);
  const loaded = await Promise.all(refs.map(({ image }) => store.loadImage(image.id)));
  return refs.map(({ dir }, idx) => ({ image: loaded[idx], dir }));
}

const collectFolders = (node: FolderTree): Folder[] => [
  node.folder,
  ...node.children.flatMap(collectFolders)
]

const resolveFolderMetadata = async (folder: Folder, store: Store): Promise<IIIFMetadataField[]> => {
  const annotation = await store.getFolderMetadata(folder.handle);
  if (!annotation) return [];

  const body = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
  return crosswalkMetadata(body, store, 'FOLDER');
}

/**
 * Creates a basic IIIF manifest for the folder (sub-)tree, according to
 * IIIF cookbook recipe 1:
 *
 * https://iiif.io/api/cookbook/recipe/0001-mvm-image/
 *
 * Sub-folders are translated into a `structures` list of IIIF Ranges that
 * mirrors the folder hierarchy.
 */
const createStaticManifest = async (
  tree: FolderTree,
  entries: FlattenedImage[],
  base: string,
  store: Store
) => {
  const folder = tree.folder;

  // Folder metadata -> manifest metadata (inherited from ancestors + the exported folder itself)
  const folders = getParentFolderHierarchy(folder, store);
  const folderMetadata = await getFlattenedParentFolderMetadata(folders, store);

  const resolveImageMetadata = async (image: LoadedFileImage): Promise<IIIFMetadataField[]> => {
    const { metadata: imageMetaBody } = await getImageMetadata(store, image.id);
    return imageMetaBody && Object.keys(imageMetaBody).length > 0
      ? crosswalkMetadata(imageMetaBody, store, 'IMAGE') : [];
  }

  const items = await Promise.all(
    entries.map(async ({ image, dir }, idx) => {
      const metadata = await resolveImageMetadata(image);
      const pathedImage: LoadedFileImage = { ...image, name: `${dir}${image.name}` };
      return createStaticImageCanvas(pathedImage, base, image.name, metadata, idx + 1, `${dir}${stripExtension(image.name)}.json`);
    })
  );

  // Sub-folder metadata -> Range metadata
  const folderMetadataEntries = await Promise.all(
    collectFolders(tree).map(async f => [f.id, await resolveFolderMetadata(f, store)] as [string, IIIFMetadataField[]])
  );

  const canvasIndex = new Map(entries.map(({ image }, idx) => [image.id, idx + 1]));
  const structures = buildRanges(tree, base, canvasIndex, new Map(folderMetadataEntries), { value: 0 });

  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: `${base}/manifest.json`,
    type: 'Manifest',
    label: { en: [ folder.name ] },
    ...(
      folderMetadata.length > 0 ? { metadata: folderMetadata } : {}
    ),
    items,
    ...(structures.length > 0 ? { structures } : {})
  }
}

/**
 * Exports a ready-to-deploy IIIF ZIP package for a folder that
 * contains images, optionally organized into sub-folders.
 *
 * Zip contains:
 * - The image files, preserving the sub-folder structure
 * - A presentation API v3 manifest with one static image canvas for each
 *   image, and a `structures` list of Ranges mirroring the sub-folders
 * - One JSON-LD annotation list for each image
 */
export const exportImageFolderToIIIF = async (folder: Folder, baseUrl: string, miradorSafe: boolean, store: Store) => {
  const base = `${baseUrl}/${folder.id}`;

  const zip = new JSZip();

  const tree = buildFolderTree(folder, store);
  const entries = await loadFlattenedImages(tree, store);

  // Package image files, preserving the sub-folder structure
  entries.forEach(({ image, dir }) => {
    zip.file(`${folder.id}/${dir}${image.name}`, image.data, { binary: true });
  });

  // Package annotation lists
  const annotationPages = await Promise.all(entries.map(({ image, dir }, idx) => {
    const name = stripExtension(image.name);
    return createAnnotationPage(
      image,
      `${base}/${dir}${name}.json`,
      `${base}/canvas/${idx + 1}`,
      miradorSafe,
      store)
  }));

  annotationPages.forEach((annotations, idx) => {
    const { image, dir } = entries[idx];
    zip.file(`${folder.id}/${dir}${stripExtension(image.name)}.json`, JSON.stringify(annotations, null, 2));
  });

  // Package manifest
  const manifest = await createStaticManifest(tree, entries, base, store);
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
  const hasNestedIIIFResources = (folder: Folder, store: Store): boolean => {
    const { folders, iiifResources } = store.getFolderContents(folder.handle);
    return iiifResources.length > 0 || folders.some(f => hasNestedIIIFResources(f, store));
  }

  const hasAnyImages = (folder: Folder, store: Store): boolean => {
    const { images, folders } = store.getFolderContents(folder.handle);
    return images.length > 0 || folders.some(f => hasAnyImages(f, store));
  }

  return hasAnyImages(folder, store) && !hasNestedIIIFResources(folder, store);
}
