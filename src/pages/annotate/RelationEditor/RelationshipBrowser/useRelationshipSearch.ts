import { useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ImageAnnotation } from '@annotorious/react';
import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';

interface RelationshipSearchResult extends RelationshipType {

  isApplicable: boolean;

}

export const useRelationshipSearch = (source: ImageAnnotation, target?: ImageAnnotation) => {

  const model = useDataModel();

  const allTypes = model.relationshipTypes;

  const applicableTypes = useMemo(() => {
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

  const fuse = useMemo(() => new Fuse<RelationshipType>([...allTypes], { 
    keys: ['name'],
    shouldSort: true,
    threshold: 0.6,
    includeScore: true 
  }), [allTypes.map(r => r.name).join(',')]);

  const search = useCallback((query: string, limit = 10) =>  {
    const applicable = new Set(applicableTypes.map(t => t.name));

    return fuse.search(query, { limit }).map(r => {
      const { item } = r;
      const isApplicable = applicable.has(item.name);

      return { ...item, isApplicable } as RelationshipSearchResult;
    });
  }, [fuse, applicableTypes]);

  return { allTypes, applicableTypes, search };

}