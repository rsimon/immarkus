import { useEffect, useState } from 'react';
import { IIIFParseResult } from '../lib/Types';
import { useStore } from '@/store';
import { fetchManifest } from '../utils/fetchManifest';

export const useIIIFResource = (id: string) => {

  const store = useStore();

  const [resource, setResource] = useState<IIIFParseResult | undefined>();
  
  useEffect(() => {
    if (!store || !id) return;

    const resource = store.getIIIFResource(id);
    if (!resource) {
      console.warn(`IIIF resource ${id} not found`);
      return;
    }

    fetchManifest(resource.uri).then(setResource);
  }, [store, id]);

  return resource;
  
}