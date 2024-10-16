import { useCallback, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { ImageAnnotation } from '@annotorious/react';
import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';

export interface RelationshipSearchResult extends RelationshipType {

  isApplicable: boolean;

}

export const useRelationshipSearch = (source: ImageAnnotation, target?: ImageAnnotation) => {

  const model = useDataModel();

  const [query, setQuery] = useState<string>('');

  const allTypes = model.relationshipTypes;

  const isApplicable = useCallback((type: RelationshipType) => {
    if (type.targetTypeId && !target) return false;

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

    const hasApplicableSource = !type.sourceTypeId || sourceTypes.has(type.sourceTypeId);
    const hasApplicableTarget = !type.targetTypeId || targetTypes.has(type.targetTypeId);

    return hasApplicableSource && hasApplicableTarget;
  }, [source, target, model])

  const applicableTypes = useMemo(() => {
    if (!target) return [];
    return model.relationshipTypes.filter(isApplicable);
  }, [model.relationshipTypes, isApplicable]);

  const fuse = useMemo(() => new Fuse<RelationshipType>([...allTypes], { 
    keys: ['name'],
    shouldSort: true,
    threshold: 0.2,
    includeScore: true 
  }), [allTypes.map(r => r.name).join(',')]);

  const results = useMemo(() =>  {
    const applicable = new Set(applicableTypes.map(t => t.name));

    if (query) { 
      const results = fuse.search(query);
      return results.map(r => {
        const { item } = r;
        const isApplicable = applicable.has(item.name);
        return { ...item, isApplicable };
      });
    } else {
      return allTypes.map(t => ({ ...t, isApplicable: applicable.has(t.name)} ));
    }
  }, [fuse, allTypes, applicableTypes, query]);

  return { allTypes, applicableTypes, isApplicable, query, setQuery, results };

}