import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { Store, useStore } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';

export interface EntityInstanceSearchProps {

  type: string;

  field: string;

  searchInherited?: boolean;

}

export interface EntityInstance {

  instance: string;

  type: string;

}

const listAllAnnotations = (store: Store) => 
  store.images.reduce<Promise<W3CAnnotation[]>>((promise, image) => 
    promise.then(all => store.getAnnotations(image.id).then(next => [...all, ...next]))
  , Promise.resolve([]));

export const useEntityInstanceSearch = (props: EntityInstanceSearchProps) => {

  // default to true
  const searchInherited = props.searchInherited === undefined ? true : props.searchInherited;

  const store = useStore();

  const [fuse, setFuse] = useState<Fuse<EntityInstance> | undefined>();

  useEffect(() => {
    listAllAnnotations(store).then(annotations => {
      // Reduce to the bodies that reference the relevant target 
      // type (and its children, if requested)
      const relevantTypes = searchInherited 
        ? store.getDataModel().getDescendants(props.type).map(t => t.id)
        : [props.type];

      const relevantBodies = annotations.reduce<W3CAnnotationBody[]>((agg, a) => {
        const bodies = Array.isArray(a.body) ? a.body : [a.body];
        return [...agg, ...bodies.filter(b => relevantTypes.includes(b.source) && 'properties' in b)];
      }, []);

      const distinctValues = relevantBodies.reduce<EntityInstance[]>((agg, body) => {
        const fieldValue = (body as any).properties[props.field];

        const exists = agg.some(({ instance }) => instance === fieldValue);
        return exists ? agg : [...agg, { instance: fieldValue, type: body.source }];
      }, []);

      const fuse = new Fuse<EntityInstance>(distinctValues, { 
        keys: [ 'instance' ],
        shouldSort: true,
        threshold: 0.6,
        includeScore: true,
        useExtendedSearch: true
      });

      setFuse(fuse);
    });
  }, []);

  const getEntityInstance = (instance: string): EntityInstance | undefined => {
    const matches = fuse.search(instance).map(result => result.item);
    return matches.length > 0 ? matches[0] : undefined;
  }    

  const searchEntityInstances = (query: string, limit?: number): EntityInstance[] =>
    fuse?.search(query, { limit: limit || 10 }).map(result => result.item);

  return { 
    initialized: fuse !== undefined,
    getEntityInstance,
    searchEntityInstances
  };

}