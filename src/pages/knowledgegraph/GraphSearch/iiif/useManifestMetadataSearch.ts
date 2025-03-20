import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { CozyManifest, CozyMetadata } from 'cozy-iiif';
import { useStore } from '@/store';
import { fetchManifests } from '@/utils/iiif';

export interface IIIFMetadataIndexRecord {

  data: CozyMetadata;

  stringified: string;

  manifests: { id: string, manifest: CozyManifest }[];

}

const isPossiblyHTML = (str: string): boolean => {
  // Check for common HTML patterns: tags with attributes, closing tags, or self-closing tags
  const htmlPattern = /<\/?[a-z][\s\S]*?(?:>|\s+\/>)/i;
  return htmlPattern.test(str);
}

const normalize = (str: string): string => 
  isPossiblyHTML(str) ? str.replace(/<[^>]*>/g, '') : str;

const buildIndex = (manifests: { id: string, manifest: CozyManifest }[]) => {
  const records = manifests.reduce<IIIFMetadataIndexRecord[]>((distinctFields, t) => {
    return t.manifest.getMetadata().reduce<IIIFMetadataIndexRecord[]>((distinctFields, meta) => {
      const normalized = { label: normalize(meta.label), value: normalize(meta.value) };
      const stringified = `${normalized.label}: ${normalized.value}`.toLowerCase();

      const existing = distinctFields.find(record => record.stringified === stringified);
      if (existing) {
        return distinctFields.map(record => record === existing
          ? { ...record, manifest: [...record.manifests, t ]}
          : record);
      } else {
        return [
          ...distinctFields,
          { data: normalized, stringified, manifests: [t] }
        ];
      }    
    }, distinctFields);
  }, []);

  const fuse = new Fuse<IIIFMetadataIndexRecord>(records, { 
    keys: ['stringified'],
    shouldSort: true,
    threshold: 0.6,
    includeScore: true,
    useExtendedSearch: true
  });

  return fuse;  
}

export const useManifestMetadataSearch = () => {

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
      setFuse(buildIndex(withId));
    });
  }, [store]);

  const search = (query: string, limit: number = 10) => {
    if (!fuse) return [];
    return fuse.search(query, { limit }).map(result => result.item);
  }

  return { 
    loading,
    search
  }

}