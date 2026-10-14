import type { MosaicNode } from 'react-mosaic-component2';
import type { WorkspaceLayout } from '@/store';

interface WorkspaceWindowImage {

  windowId: string;

  image: { id: string };

}

export const getLayoutLeaves = (layout: WorkspaceLayout): string[] =>
  typeof layout === 'string'
    ? [layout]
    : [...getLayoutLeaves(layout.first), ...getLayoutLeaves(layout.second)];

export const toImageLayout = (
  node: MosaicNode<string>,
  windows: WorkspaceWindowImage[]
): WorkspaceLayout | undefined => {
  if (typeof node === 'string')
    return windows.find(window => window.windowId === node)?.image.id;

  const first = toImageLayout(node.first, windows);
  const second = toImageLayout(node.second, windows);
  if (!first || !second) return undefined;

  return {
    direction: node.direction,
    first,
    second,
    splitPercentage: node.splitPercentage
  };
}

export const toWindowLayout = (
  layout: WorkspaceLayout,
  windows: WorkspaceWindowImage[]
): MosaicNode<string> | undefined => {
  if (typeof layout === 'string')
    return windows.find(window => window.image.id === layout)?.windowId;

  const first = toWindowLayout(layout.first, windows);
  const second = toWindowLayout(layout.second, windows);
  if (!first || !second) return undefined;

  return {
    direction: layout.direction,
    first,
    second,
    splitPercentage: layout.splitPercentage
  };
}

export const layoutMatchesImages = (layout: WorkspaceLayout, imageIds: string[]) => {
  const leaves = getLayoutLeaves(layout).sort();
  const expected = [...imageIds].sort();
  return leaves.length === expected.length && leaves.every((id, index) => id === expected[index]);
}
