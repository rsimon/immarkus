import { EntityType } from '@/model';
import { W3CAnnotationBody } from '@annotorious/react';

const toSafeKey = (body: W3CAnnotationBody, str: string) =>
  body.id + '@' + str.replaceAll(/[.,\/#!$%^&*;:{}=\-_`~()\s]/g, '_').toLowerCase();

interface BodyAndEntityType {

  body: W3CAnnotationBody,

  entityType: EntityType;

}

export const createSafeKeys = (tuples: BodyAndEntityType[]) => {
  // Converts schema names to keys we can safely use with formik, and
  // keeps a lookup table (or, rather, list): key -> { name, body }
  const safeKeys: [string, { name: string, body: W3CAnnotationBody }][] = tuples.reduce((safeKeys, { body, entityType }) => (
    [...safeKeys, ...(entityType.properties || []).map(property => ([toSafeKey(body, property.name), { name: property.name, body }]))]
  ), []);

  const getKey = (b: W3CAnnotationBody, n: string) => {
    const k = safeKeys.find(([_, { name, body }]) => name === n && b.id === body.id);
    return k ? k[0] : undefined;
  }

  const getName = (k: string) => { 
    const n = safeKeys.find(([key, _]) => k === key);
    return n ? n[1].name : undefined;
  }

  return {
    getKey,
    getName
  }

}