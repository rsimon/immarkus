import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { CozyCanvas, CozyManifest, CozyMetadata } from 'cozy-iiif';
import { useStore } from '@/store';
import { fetchManifests } from '@/utils/iiif';
import { GraphNodeType } from '../../Types';

export interface IIIFMetadataIndexRecord {

  data: CozyMetadata;

  stringified: string;

  manifests?: { id: string, manifest: CozyManifest }[];

  canvases?: { manifestId: string, canvas: CozyCanvas }[];

}

const isPossiblyHTML = (str: string): boolean => {
  // Check for common HTML patterns: tags with attributes, closing tags, or self-closing tags
  const htmlPattern = /<\/?[a-z][\s\S]*?(?:>|\s+\/>)/i;
  return htmlPattern.test(str);
}

const normalize = (str: string): string => 
  isPossiblyHTML(str) ? str.replace(/<[^>]*>/g, '') : str; 

const buildManifestIndexRecords = (manifests: { id: string, manifest: CozyManifest }[]) => {
  return manifests.reduce<IIIFMetadataIndexRecord[]>((distinct, t) => {
    return t.manifest.getMetadata().reduce<IIIFMetadataIndexRecord[]>((distinct, meta) => {
      const normalized = { label: normalize(meta.label), value: normalize(meta.value) };
      const stringified = `${normalized.label}: ${normalized.value}`.toLowerCase();

      const existing = distinct.find(record => record.stringified === stringified);
      if (existing) {
        return distinct.map(record => record === existing
          ? { ...record, manifest: [...record.manifests, t ]}
          : record);
      } else {
        return [
          ...distinct,
          { data: normalized, stringified, manifests: [t] }
        ];
      }    
    }, distinct);
  }, []);
}

const buildCanvasIndexRecords = (manifests: { id: string, manifest: CozyManifest }[]) => {
  // First, collect the metadata from the manifests themselves
  const manifestRecords = buildManifestIndexRecords(manifests);

  // Then loop through all manifests,...
  return manifests.reduce<IIIFMetadataIndexRecord[]>((distinct, t) => {
    const { canvases } = t.manifest;

    // ...through each canvas on each manifest,...
    return canvases.reduce<IIIFMetadataIndexRecord[]>((distinct, canvas) => {

      // ...and then through each metadata field
      return canvas.getMetadata().reduce<IIIFMetadataIndexRecord[]>((distinct, meta) => {
        const normalized = { label: normalize(meta.label), value: normalize(meta.value) };
        const stringified = `${normalized.label}: ${normalized.value}`.toLowerCase();

        // Check if this key/valu pair already exists
        const existing = distinct.find(record => record.stringified === stringified);
        if (existing) {
          return distinct.map(record => record === existing
            ? { ...record, canvases: [...(record.canvases || []), { manifestId: t.id, canvas } ]}
            : record);
        } else {
          return [
            ...distinct,
            { data: normalized, stringified, canvases: [{ manifestId: t.id, canvas }] }
          ];
        }
        return distinct;
      }, distinct);  
    }, distinct);
  }, manifestRecords);
}

export const useManifestMetadataSearch = (objectType: GraphNodeType) => {

  const store = useStore();

  const [loading, setLoading] = useState(true);

  const [fuse, setFuse] = useState<Fuse<IIIFMetadataIndexRecord> | undefined>();

  useEffect(() => {
    const { iiifResources } = store;

    const uris = iiifResources.map(r => r.uri);

    // Fetches all manifests, using cached versions if possbile,
    // or throttled HTTP downloads if not.
    fetchManifests(uris).then(manifests => {
      const withId = manifests.map(manifest => {
        const id = iiifResources.find(r => r.uri === manifest.id)?.id;
        return { id, manifest }
      });

      setLoading(false);

      const records = objectType === 'FOLDER' 
        ? buildManifestIndexRecords(withId)
        : buildCanvasIndexRecords(withId);

      const fuse = new Fuse<IIIFMetadataIndexRecord>(records, { 
        keys: ['stringified'],
        shouldSort: true,
        threshold: 0.6,
        includeScore: true,
        useExtendedSearch: true
      });

      setFuse(fuse);
    });
  }, [store, objectType]);

  const search = (query: string, limit: number = 10) => {
    if (!fuse) return [];
    return fuse.search(query, { limit }).map(result => result.item);
  }

  return { 
    loading,
    search
  }

}