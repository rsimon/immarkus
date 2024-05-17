import { W3CAnnotation } from '@annotorious/react';
import { Store } from '../Store';
import { Image, RelationPropertyDefinition } from '@/model';

interface InstantiableEntityType {

  typeId: string;

  labelProperty: string;

}

interface InstantiableTypeHierarchy {

  typeIds: string[];

  labelProperty: string;

}

interface RelatedAnnotation {

  imageId: string;

  annotationId: string;

  sourceEntityType: string;

  targetEntityType: string;

  targetInstance: string;

  targetInstanceLabelProperty: string;

}

export const createRelationGraph = (store: Store) => {

  const { images } = store;

  const model = store.getDataModel();

  /* STEP 1. Go through all entity types, look for relations.
  // These define which combinations of (entity type + labelProperty)
  // determine possible instances.
  const instantiableTypes: InstantiableEntityType[] = 
    model.entityTypes.reduce<InstantiableEntityType[]>((all, type) =>  {
      const it = (type.properties || [])
        .filter(p => p.type === 'relation')
        .map(p => {
          const rp = p as RelationPropertyDefinition;
          return { typeId: rp.targetType, labelProperty: rp.labelProperty };
        });

      return [...all, ...it];
    }, []);

  // STEP 2. De-duplicate the list of instantiable types, and expand,
  // so that in addition to (entity type + labelProperty), we have
  // ALL possible entity types (root type + all descendant types)
  // in the list.
  const instantiableTypeHierarchies: InstantiableTypeHierarchy[] =
    instantiableTypes.reduce<InstantiableTypeHierarchy[]>((all, type) => {
      const exists = all.find(ith => ith.typeIds.some(id => id === type.typeId) && ith.labelProperty === type.labelProperty);
      if (exists) {
        return all;
      } else {
        const descendants = model.getDescendants(type.typeId);
        return [
          ...all,
          { typeIds: [...descendants.map(t => t.id)], labelProperty: type.labelProperty }
        ];
      }
    }, []);
    */

  // STEP 3. Now, the big step... go through ALL ANNOTATIONS, and 
  // collect instances. Note that this is an async operation.

  // STEP 3a. Get all images from the store, and load all annotations
  // for each image.
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

    console.log(relatedAnnotations);

    const getInboundLinks = (typeId: string, properties: any) => {
      const inbound = relatedAnnotations.filter(r =>
        r.targetEntityType === typeId && properties[r.targetInstanceLabelProperty] === r.targetInstance);

      return inbound;
    }

    console.log(getInboundLinks('road', { Name: 'Central Fountain' }));

  });

}