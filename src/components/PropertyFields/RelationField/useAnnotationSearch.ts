import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { Store, useStore } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';

interface EntityInstanceSearchProps {

  type: string;

  field: string;

  searchInherited?: boolean;

}

const listAllAnnotations = (store: Store) => 
  store.images.reduce<Promise<W3CAnnotation[]>>((promise, image) => 
    promise.then(all => store.getAnnotations(image.id).then(next => [...all, ...next]))
  , Promise.resolve([]));

export const useEntityInstanceSearch = (props: EntityInstanceSearchProps) => {

  // default to true
  const searchInherited = props.searchInherited === undefined ? true : props.searchInherited;

  const store = useStore();

  const [fuse, setFuse] = useState<Fuse<string> | undefined>();

  useEffect(() => {
    listAllAnnotations(store).then(annotations => {
      // Reduce to the bodies that reference the relevant target 
      // type (and its children, if requested)
      const relevantTypes = new Set(
        searchInherited 
          ? store.getDataModel().getDescendants(props.type).map(t => t.id)
          : [props.type]
      );

      console.log('recursive', searchInherited);
      console.log(Array.from(relevantTypes));

      const relevantBodies = annotations.reduce<W3CAnnotationBody[]>((agg, a) => {
        const bodies = Array.isArray(a.body) ? a.body : [a.body];
        return [...agg, ...bodies.filter(b => relevantTypes.has(b.source) && 'properties' in b)];
      }, []);

      const distinctValues = new Set(relevantBodies.map(b => (b as any).properties[props.field]));

      const fuse = new Fuse<string>(Array.from(distinctValues), { 
        shouldSort: true,
        threshold: 0.6,
        includeScore: true,
        useExtendedSearch: true
      });

      setFuse(fuse);
    });
  }, []);

  const searchEntityInstances = (query: string, limit?: number) =>
    fuse?.search(query, { limit: limit || 10 }).map(result => result.item);

  return { 
    initialized: fuse !== undefined,
    searchEntityInstances
  };

}