import { Folder } from '@/model';
import { Store } from '@/store';
import { FolderTree, IIIFMetadataField } from './types';

export const buildFolderTree = (folder: Folder, store: Store, relPath: string[] = []): FolderTree => {
  const { images, folders } = store.getFolderContents(folder.handle);
  return {
    folder,
    relPath,
    images,
    children: folders.map(child => buildFolderTree(child, store, [...relPath, child.name]))
  };
}

const treeHasImages = (node: FolderTree): boolean =>
  node.images.length > 0 || node.children.some(treeHasImages);

/**
 * Builds the IIIF Range for the given sub-folder, plus nested Ranges for
 * its own sub-folders. Folders that contain no images in their sub-tree are omitted.
 */
const buildRange = (
  node: FolderTree,
  base: string,
  canvasIndex: Map<string, number>,
  folderMetadata: Map<string, IIIFMetadataField[]>,
  counter: { value: number }
) => {
  if (!treeHasImages(node)) return;

  // Assign the range number before recursing, so IDs read in document order
  counter.value += 1;
  const id = `${base}/range/${counter.value}`;

  const canvasItems = node.images.map(image => ({
    id: `${base}/canvas/${canvasIndex.get(image.id)}`,
    type: 'Canvas'
  }));

  const rangeItems = buildRanges(node, base, canvasIndex, folderMetadata, counter);
  const metadata = folderMetadata.get(node.folder.id) || [];

  return {
    id,
    type: 'Range',
    label: { en: [node.folder.name] },
    ...(metadata.length > 0 ? { metadata } : {}),
    items: [...canvasItems, ...rangeItems]
  };
}

export const buildRanges = (
  node: FolderTree,
  base: string,
  canvasIndex: Map<string, number>,
  folderMetadata: Map<string, IIIFMetadataField[]>,
  counter: { value: number }
) =>
  node.children.reduce<ReturnType<typeof buildRange>[]>((ranges, child) => {
    const range = buildRange(child, base, canvasIndex, folderMetadata, counter);
    return range ? [...ranges, range] : ranges;
  }, []);
