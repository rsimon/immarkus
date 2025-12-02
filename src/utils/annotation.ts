import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';

/** Returns the 'classifying' bodies with the given Entity Type, if any **/
export const getEntityBodies = (annotation: W3CAnnotation, type?: string) => {
  if (!annotation?.body) return [];

  const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
  return type 
    ? bodies.filter(b => b.purpose === 'classifying' && b.source === type)
    : bodies.filter(b => b.purpose === 'classifying' && b.source);
}

/** Returns all entity type IDs on this anntoation, if any */
export const getEntityTypes = (annotation: W3CAnnotation) =>
  getEntityBodies(annotation).map(b => b.source);

/** Tests if the given annotation includes the given Entity Type as a 'classifying' body **/
export const hasEntity = (annotation: W3CAnnotation, type: string) =>
  getEntityBodies(annotation, type).length > 0;

/** Tests if the given body includes the given key/value in its properties **/
export const hasPropertyValue = (body: W3CAnnotationBody, propKey: string, propValue: any) => {
  if (!('properties' in body)) return false;

  const val = body.properties[propKey];
  if (!val) return false;

  // Compare non-pimitive types by value
  return JSON.stringify(val) === JSON.stringify(propValue);
}

export const getLastEdit = (annotations: W3CAnnotation[]): Date | undefined => {
  // Helper
  const getLatestTimestamp = (annotation: W3CAnnotation): Date | undefined => {
    const timestamps: Date[] = [];

    if (annotation.created) timestamps.push(new Date(annotation.created));
    if (annotation.modified) timestamps.push(new Date(annotation.modified));

    const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    bodies.forEach(body => {
      if (body.created) timestamps.push(new Date(body.created));
      if (body.modified) timestamps.push(new Date(body.modified));
    });

    return timestamps.length > 0 
      ? new Date(Math.max(...timestamps.map(t => t.getTime())))
      : undefined
  };

  const timestamps = annotations.map(a => getLatestTimestamp(a)).filter(Boolean);
  return timestamps.length > 0 
      ? new Date(Math.max(...timestamps.map(t => t.getTime())))
      : undefined
}
