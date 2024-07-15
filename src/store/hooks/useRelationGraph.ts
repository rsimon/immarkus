import { W3CAnnotation } from '@annotorious/react';
import { Image, RelationPropertyDefinition } from '@/model';
import { useStore } from './useStore';
import { useEffect, useState } from 'react';
import { getEntityBodies, hasPropertyValue } from '@/utils/annotation';

export interface RelationGraph {

  listRelations(): RelatedAnnotation[]
  
  getInboundLinks(typeIdOrAnnotation: string | W3CAnnotation, properties?: any): RelatedAnnotation[];

  resolveTargets(sourceAnnotation: RelatedAnnotation): ResolvedRelation[];

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

export interface ResolvedRelation extends RelatedAnnotation {

  targetImage: Image;

  targetAnnotation: W3CAnnotation;

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
                .map(p => {
                  const properties = (b as any).properties;
                  return (properties && properties[p.name]) ? { 
                    image: image,
                    annotation: annotation,
                    relationName: p.name,
                    sourceEntityType: entityType.id,
                    targetEntityType: properties[p.name].type,
                    targetInstance: properties[p.name].instance,
                    targetInstanceLabelProperty: (p as RelationPropertyDefinition).labelProperty
                  } : undefined
                }).filter(r => Boolean(r));

            return [...all, ...outboundRelations];
          } else {
            return all;
          }
        }, []);

        return [...all, ...related];
      }, []);

      const _getInboundLinks = (typeId: string, properties: any) => {
        const inbound = relatedAnnotations.filter(r =>
          r.targetEntityType === typeId && properties[r.targetInstanceLabelProperty] === r.targetInstance);

        return inbound;
      }

      const getInboundLinks = (typeOrAnnotation: string | W3CAnnotation, properties?: any) => {
        if (typeof typeOrAnnotation === 'string') {
          return _getInboundLinks(typeOrAnnotation, properties!);
        } else {
          const bodies = Array.isArray(typeOrAnnotation.body) ? typeOrAnnotation.body : [typeOrAnnotation.body];
          
          const entityBodies = bodies.filter(b => 
            b.source && b.purpose === 'classifying' && (b as any).properties);

          return entityBodies.reduce<RelatedAnnotation[]>((all, body) => {
            return [...all, ..._getInboundLinks(body.source, (body as any).properties)]
          }, []);
        }
      }

      const listRelations = () => ([...relatedAnnotations]);

      /**
       * This is util is likely going to change. Infers a list of links (between
       * specific annotations!) dynamically from a RelatedAnnotation (which
       * links a specific annotation to all annotations that match the target
       * entity instance.)
       */
      const resolveTargets = (related: RelatedAnnotation) => {
        const { targetEntityType, targetInstance, targetInstanceLabelProperty } = related;

        return imageAnnotations.filter(({ annotation }) => {
          const targetEntities = getEntityBodies(annotation, targetEntityType);
          return targetEntities.some(body => 
            hasPropertyValue(body, targetInstanceLabelProperty, targetInstance));
        }).map(({ image, annotation }) => ({
          ...related,
          targetImage: image,
          targetAnnotation: annotation
        }));
      }

      setGraph({ getInboundLinks, listRelations, resolveTargets });
    });
  }, []);

  return graph;

}