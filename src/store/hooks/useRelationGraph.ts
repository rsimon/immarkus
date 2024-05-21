import { W3CAnnotation } from '@annotorious/react';
import { Image, RelationPropertyDefinition } from '@/model';
import { useStore } from './useStore';
import { useEffect, useState } from 'react';
import { Store } from '../Store';
import { GraphLink } from '@/pages/knowledgegraph/Types';

export interface RelationGraph {

  getEntityLinks(): GraphLink[];
  
  getInboundLinks(typeId: string, properties: any): RelatedAnnotation[];

}

export interface RelatedAnnotation {

  imageId: string;

  annotationId: string;

  relationName: string;

  sourceEntityType: string;

  targetEntityType: string;

  targetInstance: string;

  targetInstanceLabelProperty: string;

}

export const buildRelationGraph = (store: Store): Promise<RelationGraph> => {

  const { images } = store;

  const model = store.getDataModel();

  const imagesQuery = images.map(image => 
    store.getAnnotations(image.id).then(annotations => ({ annotations, image })));
  
  return Promise.all(imagesQuery).then(imagesResult => {
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
                imageId: image.id,
                annotationId: annotation.id,
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

    const getEntityLinks = () => {
      const links = relatedAnnotations.reduce<GraphLink[]>((all, r) => {
        const isSame = (l: GraphLink) => l.source === r.sourceEntityType && l.target === r.targetEntityType;
        return all.find(isSame)
          ? all.map(l => isSame(l) ? { ...l, value: l.value + 1 } : l)
          : [...all, { source: r.sourceEntityType, target: r.targetEntityType, value: 1 }];
      }, []);

      return links;
    }

    return { getEntityLinks, getInboundLinks };
  });

}

export const useRelationGraph = () => {

  const store = useStore();

  const [graph, setGraph] = useState<RelationGraph | undefined>(undefined);

  useEffect(() => {
    buildRelationGraph(store).then(setGraph);
  }, []);

  return graph;

}