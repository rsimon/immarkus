import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataModel } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { serializePropertyValue } from '@/utils/serialize';
import { DropdownOption } from '../Types';

export const useSubConditions = (
  annotations: W3CAnnotation[],
  subjectId: string,
  attribute?: DropdownOption,
) => {
  const model = useDataModel();

  const { t } = useTranslation('knowledgegraph');

  const comparatorOptions = useMemo(() => ([
    { label: t('graphSearch.comparators.is'), value: 'IS' },
    { label: t('graphSearch.comparators.isEmpty'), value: 'IS_EMPTY' },
    { label: t('graphSearch.comparators.isNotEmpty'), value: 'IS_NOT_EMPTY' }
  ]), [t]);

  const type = useMemo(() => model.getEntityType(subjectId, true), [subjectId]);

  const properties = useMemo(() => (type?.properties || []), [type]);

  const values = useMemo(() => {
    if (!attribute) return [];

    const descendants = 
      new Set(model.getDescendants(subjectId).map(t => t.id));

    const entityBodies = annotations.reduce<W3CAnnotationBody[]>((all, annotation) => {
      const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
      return [...all, ...bodies.filter(b => b.purpose === 'classifying' && descendants.has(b.source))];      
    }, []);

    const values = entityBodies.reduce<string[]>((all, body) => {
      if (!('properties' in body && body.properties)) return all;

      if (!body.properties[attribute.value]) return all;
      
      const type = model.getEntityType(body.source, true);
      if (!type) return all;

      const property = (type.properties || []).find(p => p.name === attribute.value);
      if (!property) return all;

      const serialized = serializePropertyValue(property, body.properties[attribute.value]);
      return [...all, ...serialized]; 
    }, []);

    // Distinct values only, sorted alphabetically
    return [...Array.from(new Set(values))].sort();
  }, [properties, annotations, subjectId, attribute]);

  return { comparatorOptions, properties, values };

}