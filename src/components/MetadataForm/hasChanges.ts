import { dequal } from 'dequal/lite';
import { W3CAnnotationBody } from '@annotorious/react';

export const hasChanges = (a: W3CAnnotationBody, b: W3CAnnotationBody) => {
  if (a === undefined && b === undefined)
    return false;

  const propertiesA = a && 'properties' in a ? a.properties : {};
  const propertiesB = b && 'properties' in b ? b.properties : {};

  return !dequal(propertiesA, propertiesB);
}