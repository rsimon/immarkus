import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { Graph, GraphLink, GraphNode } from '../Graph';

export const useGraph = () => {

  const store = useStore();

  const datamodel = store.getDataModel();

  const [graph, setGraph] = useState<Graph>();

  const { images } = store;

  const promises = images.map(image => 
    store.getAnnotations(image.id).then(annotations => ({ annotations, image })));

  useEffect(() => {
    Promise.all(promises).then(result => {
      const nodes: GraphNode[] = [
        ...images.map(image => ({ id: image.id, type: 'IMAGE' } as GraphNode)),
        ...datamodel.entityTypes.map(type => ({ id: type.id, type: 'ENTITY_CLASS' } as GraphNode)),
      ];
  
      const links =
        result.reduce<GraphLink[]>((all, { annotations, image }) => {
          // N annotations on this image, each carrying 0 to M entity links
          const entityLinks = annotations.reduce<GraphLink[]>((all, annotation) => {
            if ('selector' in annotation.target) {
              const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
  
              const links: GraphLink[] = 
                bodies.filter(b => b.source).map(b => ({ source: image.id, target: b.source }));
              
              return [...all, ...links ];
            } else {
              // Not an image annotation
              return all;
            }
          }, []);
  
          return [...all, ...entityLinks];
      }, []);
  
      setGraph({ nodes, links });
    });
  }, []);

  return graph;

}