import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { CozyManifest, CozyMetadata } from 'cozy-iiif';
import { useStore } from '@/store';
import { fetchManifests } from '@/utils/iiif';

const buildIndex = (manifests: CozyManifest[]) => {
  const metadata = manifests
    .flatMap(m => m.getMetadata())
    .reduce<CozyMetadata[]>((distinctFields, meta) => {
      const exists = distinctFields.some(({ label, value })=>
        label.toLowerCase() === meta.label.toLowerCase() && value.toLowerCase() === meta.value.toLowerCase());
      return exists ? distinctFields : [...distinctFields, meta ];
    }, []);

  const fuse = new Fuse<CozyMetadata>(metadata, { 
    keys: ['label', 'value'],
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

  const [fuse, setFuse] = useState<Fuse<CozyMetadata> | undefined>();

  useEffect(() => {
    const uris = store.iiifResources.map(r => r.uri);

    // Fetches all manifests, using cached versions if possbile,
    // or throttled HTTP downloads if not.
    fetchManifests(uris).then(manifests => {
      setLoading(false);
      setFuse(buildIndex(manifests));
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