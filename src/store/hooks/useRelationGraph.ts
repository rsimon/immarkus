import { W3CAnnotation } from '@annotorious/react';
import { Image, RelationPropertyDefinition } from '@/model';
import { useStore } from './useStore';
import { useEffect, useState } from 'react';

export interface RelationGraph {
  
  getInboundLinks(typeId: string, properties: any): RelatedAnnotation[];

}

export interface RelatedAnnotation {

  image: Image;

  annotation: W3CAnnotation;

  relationName: string;

  sourceEntityType: string;

  targetEntityType: string;

  targetInstance: string;

  targetInstanceLabelProperty: string;

}

export const useRelationGraph = () => {

  const store = useStore();

  const { images } = store;

  const model = store.getDataModel();

  const [graph, setGraph] = useState<RelationGraph | undefined>(undefined);

  useEffect(() => {
    const imagesQuery = images.map(image => 
      store.getAnnotations(image.id).then(annotations => ({ annotations, image })));
    
    Promise.all(imagesQuery).then(imagesResult => {
      const imageAnnotations = imagesResult.reduce<{ image: Image, annotation: W3CAnnotation}[]>((all, { image, annotations }) => (
        [...all, ...annotations.filter(a => 'selector' in a.target).map(annotation => ({ annotation, image }))]
      ), []);

      // Collect annotations that point to instances
      const relatedAnnotations = imageAnnotations.reduce<RelatedAnnotation[]>((all, { image, annotation }) => {
        const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];

        // Entity bodies that have an instantiable type & a defined label property
        const related = bodies.reduce<RelatedAnnotation[]>((all, b) => {
          if (b.source) {
            const entityType = model.getEntityType(b.source, true);

            const outboundRelations: RelatedAnnotation[]  = 
              (entityType.properties || [])
                .filter(p => p.type === 'relation')
                .map(p => ({ 
                  image: image,
                  annotation: annotation,
                  relationName: p.name,
                  sourceEntityType: entityType.id,
                  targetEntityType: (b as any).properties[p.name].type,
                  targetInstance: (b as any).properties[p.name].instance,
                  targetInstanceLabelProperty: (p as RelationPropertyDefinition).labelProperty,
                }));

            return [...all, ...outboundRelations];
          } else {
            return all;
          }
        }, []);

        return [...all, ...related];
      }, []);

      const getInboundLinks = (typeId: string, properties: any) => {
        const inbound = relatedAnnotations.filter(r =>
          r.targetEntityType === typeId && properties[r.targetInstanceLabelProperty] === r.targetInstance);

        return inbound;
      }

      setGraph({ getInboundLinks });
    });
  }, []);

  return graph;

}