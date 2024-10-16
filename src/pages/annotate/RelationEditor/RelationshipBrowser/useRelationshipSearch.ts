import { useMemo } from 'react';
import { useDataModel } from '@/store';
import { ImageAnnotation } from '@annotorious/react';

export const useRelationshipSearch = (source: ImageAnnotation, target?: ImageAnnotation) => {

  const model = useDataModel();

  const allRelationshipTypes = model.relationshipTypes;

  const applicableRelationshipTypes = useMemo(() => {
    if (!target) return [];

    const getEntityTypes = (annotation: ImageAnnotation) => {
      // The entity type ID tags on this annotation
      const entityIds = annotation.bodies
        .filter(b => b.purpose === 'classifying')
        .map(body => (body as any).source as string);

      // Resolve full parent hierarchy
      const withAncestors = entityIds.reduce<string[]>((all, entityId) => {
        return [...all, ...model.getAncestors(entityId).map(t => t.id)];
      }, [...entityIds]);

      // All entity classes the annotation is tagged with, incl. hierachical ancestors
      return new Set(withAncestors); 
    }

    const sourceTypes = getEntityTypes(source);
    const targetTypes = getEntityTypes(target);

    const filteredBySource = model.relationshipTypes
      .filter(type => !type.sourceTypeId || sourceTypes.has(type.sourceTypeId));

    const filteredByTarget = filteredBySource
      .filter(type => !type.targetTypeId || targetTypes.has(type.targetTypeId));

    return filteredByTarget;
  }, [source, target, model]);

  return { allRelationshipTypes, applicableRelationshipTypes };

}