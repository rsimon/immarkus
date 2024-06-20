import { useMemo } from 'react';
import { useDataModel } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { serializePropertyValue } from '@/utils/serialize';

export const useSubConditions = (
  annotations: W3CAnnotation[],
  subjectId: string, 
  attribute?: string,
) => {
  const model = useDataModel();

  const type = useMemo(() => model.getEntityType(subjectId, true), [subjectId]);

  const properties = useMemo(() => (type.properties || []), [type]);

  const values = useMemo(() => {
    if (!attribute) return [];

    const entityBodies = annotations.reduce<W3CAnnotationBody[]>((all, annotation) => {
      const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
      return [...all, ...bodies.filter(b => b.purpose === 'classifying' && b.source === subjectId)];      
    }, []);

    const values = entityBodies.reduce<string[]>((all, body) => {
      if (!('properties' in body && body.properties)) return all;

      if (!body.properties[attribute]) return all;
      
      const type = model.getEntityType(body.source, true);
      if (!type) return all;

      const property = (type.properties || []).find(p => p.name === attribute);
      if (!property) return all;

      const serialized = serializePropertyValue(property, body.properties[attribute]);
      return [...all, serialized]; 
    }, []);

    // Distinct values only, sorted alphabetically
    return [...Array.from(new Set(values))].sort();
  }, [properties, annotations, subjectId, attribute]);

  return { properties, values };

}