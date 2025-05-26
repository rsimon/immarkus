import { MultiPolygon, serializeSVGSelector, W3CAnnotation } from '@annotorious/react';
import { DataModelStore } from '../datamodel';

/** 
 * Make sure there are no entity bodies where 'source' points to an entity 
 * that doesn't exist in the data model.
 */
export const repairAnnotations = (annotations: W3CAnnotation[], model: DataModelStore): W3CAnnotation[] => {
  const ids = new Set(model.entityTypes.map(e => e.id));

  return annotations
    .filter(a => {
      // Previous broken versions of the Annotorious boolean plugin
      // could create empty targets from subtract operations 
      const selector = (a.target as any).selector;
      return !(selector?.type === 'SvgSelector' && selector?.value === '<svg><g></g></svg>');
    })
    .map(a => {
      // Previous broken Annotorious versions didn't serialize MULTIPOLYGON shapes to W3C!
      const isUnserializedMultiPolygon = (a.target as any).selector?.type === 'MULTIPOLYGON';
      if (isUnserializedMultiPolygon) {
        const geom = (a.target as any).selector as MultiPolygon;
        const fixed = serializeSVGSelector(geom);

        return {
          ...a,
          target: {
            ...a.target,
            selector: fixed
          }
        } as W3CAnnotation;
      } else {
        return a;
      }
    })
    .map(annotation => {
      if (typeof annotation.selector === 'object' && 'selector' in annotation.target) {
        // Remove bodies that point to unknown classes
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
