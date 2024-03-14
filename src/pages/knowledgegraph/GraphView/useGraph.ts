import { useEffect, useState } from 'react';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { useStore } from '@/store';
import { Graph, GraphLink, GraphNode } from '../Types';
import { EntityType, Image } from '@/model';

export const useGraph = () => {

  const store = useStore();

  const datamodel = store.getDataModel();

  const [graph, setGraph] = useState<Graph>();

  const { images } = store;

  const promises = images.map(image => 
    store.getAnnotations(image.id).then(annotations => ({ annotations, image })));

  useEffect(() => {
    Promise.all(promises).then(result => {
      const annotations = result.reduce<W3CAnnotation[]>((all, { image, annotations }) => (
        [...all, ...annotations]
      ), []);

      const entityBodies = annotations.reduce<W3CAnnotationBody[]>((all, annotation) => (
        [...all, ...(Array.isArray(annotation.body) ? annotation.body : [annotation.body])]
      ), []).filter(b => b.source);

      const getImageDegree = (image: Image) =>
        result.find(t => t.image.id === image.id).annotations.length;

      const getEntityTypeDegree = (type: EntityType) =>
        entityBodies.filter(b => b.source === type.id).length;

      const nodes: GraphNode[] = [
        ...images.map(image => ({ 
            id: image.id, 
            type: 'IMAGE', 
            degree: getImageDegree(image) 
          } as GraphNode)),

        ...datamodel.entityTypes.map(type => ({ 
            id: type.id, 
            type: 'ENTITY_TYPE',
            degree: getEntityTypeDegree(type)
          } as GraphNode)),
      ];

      // Record minimum & maximum number of links per node
      let minDegree = result.length === 0 ? 0 : Infinity;

      let maxDegree = 0;
  
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

          if (entityLinks.length > maxDegree)
            maxDegree = entityLinks.length; 

          if (entityLinks.length < minDegree)
            minDegree = entityLinks.length;
  
          return [...all, ...entityLinks];
      }, []);
  
      setGraph({ nodes, links, minDegree, maxDegree });
    });
  }, []);

  return graph;

}