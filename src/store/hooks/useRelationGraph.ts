import { W3CAnnotation } from '@annotorious/react';
import { Image, RelationPropertyDefinition } from '@/model';
import { useStore } from './useStore';

interface RelatedAnnotation {

  imageId: string;

  annotationId: string;

  sourceEntityType: string;

  targetEntityType: string;

  targetInstance: string;

  targetInstanceLabelProperty: string;

}

export const useRelationGraph = () => {

  const store = useStore();

  const { images } = store;

  const model = store.getDataModel();

  const imagesQuery = images.map(image => 
    store.getAnnotations(image.id).then(annotations => ({ annotations, image })));

  Promise.all(imagesQuery).then(imagesResult => {
    const imageAnnotations = imagesResult.reduce<{ image: Image, annotation: W3CAnnotation}[]>((all, { image, annotations }) => (
      [...all, ...annotations.filter(a => 'selector' in a.target).map(annotation => ({ annotation, image }))]
    ), []);

    // STEP 3b. Collect annotations that point to instances
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

    return {
      getInboundLinks
    }

  });

}