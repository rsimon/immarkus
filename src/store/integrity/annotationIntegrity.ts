import { MultiPolygon, serializeSVGSelector, W3CAnnotation } from '@annotorious/react';
import { DataModelStore } from '../datamodel';

/** 
 * Make sure there are no entity bodies where 'source' points to an entity 
 * that doesn't exist in the data model.
 */
export const repairAnnotations = (annotations: W3CAnnotation[], model: DataModelStore): W3CAnnotation[] => {
  const ids = new Set(model.entityTypes.map(e => e.id));

  return annotations
    .map(a => {
      const isCorrect = (a.target as any).selector?.type !== 'MULTIPOLYGON';
      if (isCorrect) {
        return a;
      } else {
        const geom = (a.target as any).selector as MultiPolygon;
        const fixed = serializeSVGSelector(geom);

        return {
          ...a,
          target: {
            ...a.target,
            selector: fixed
          }
        } as W3CAnnotation;
      }
    })
    .map(annotation => {
      if (typeof annotation.selector === 'object' && 'selector' in annotation.target) {
        const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
        return ({
          ...annotation,
          body: bodies.filter(b => !b.source || ids.has(b.source))
        });
      } else {
        return annotation;
      }
    });
}
