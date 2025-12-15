import { useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { useStore } from '@/store';
import { AddImageListItem } from './Types';

export const useSearch = () => {

  const store = useStore();

  const items: AddImageListItem[] = useMemo(() => {
    const { images, iiifResources, folders } = store;

    const manifests = iiifResources as IIIFManifestResource[];

    const canvases = manifests.reduce<CanvasInformation[]>((all, manifest) => (
      [...all, ...manifest.canvases]
    ), []);
      
    return [...folders, ...manifests, ...images, ...canvases];
  }, []);

  const fuse = useMemo(() => new Fuse<AddImageListItem>(items, { 
    keys: ['name'],
    shouldSort: true,
    ignoreLocation: true,
    threshold: 0.6,
    includeScore: true,
    useExtendedSearch: true
  }), [items]);

  const search = useCallback((query: string, limit?: number) => {
    return fuse.search(query, { limit: limit || 10 })
      .filter(r => r.score < 0.2)
      .map(r => r.item)
  }, [fuse]);

  return search;

}