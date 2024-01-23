import { W3CAnnotation } from '@annotorious/react';
import { DataModelStore } from '../datamodel';

/** 
 * Make sure there are no bodies where 'source' points to an entity 
 * that doesn't exist in the data model.
 */
export const repairAnnotations = (annotations: W3CAnnotation[], model: DataModelStore): W3CAnnotation[] => {
  const ids = new Set(model.entityTypes.map(e => e.id));

  return annotations.map(annotation => {
    const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    return ({
      ...annotation,
      body: bodies.filter(b => !b.source || ids.has(b.source))
    })
  });
}
