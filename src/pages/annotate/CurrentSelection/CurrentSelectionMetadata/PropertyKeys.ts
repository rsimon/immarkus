import { Entity } from '@/model';
import { W3CAnnotationBody } from '@annotorious/react';

const toSafeKey = (body: W3CAnnotationBody, str: string) =>
  body.id + '@' + str.replaceAll(/[.,\/#!$%^&*;:{}=\-_`~()\s]/g, '_').toLowerCase();

interface BodyAndEntity {

  body: W3CAnnotationBody,

  entity: Entity;

}

export const createSafeKeys = (tuples: BodyAndEntity[]) => {
  // Converts schema names to keys we can safely use with formik, and
  // keeps a lookup table (or, rather, list): key -> { name, body }
  const safeKeys: [string, { name: string, body: W3CAnnotationBody }][] = tuples.reduce((safeKeys, { body, entity }) => (
    [...safeKeys, ...entity.schema.map(property => ([toSafeKey(body, property.name), { name: property.name, body }]))]
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