import { useCallback, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { AnnotationBody, ImageAnnotation, W3CImageAnnotation } from '@annotorious/react';
import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';

export interface RelationshipSearchResult extends RelationshipType {

  isApplicable: boolean;

}

export const useRelationshipSearch = (source?: ImageAnnotation | W3CImageAnnotation, target?: ImageAnnotation | W3CImageAnnotation) => {

  const model = useDataModel();

  const [query, setQuery] = useState<string>('');

  const allTypes = model.relationshipTypes;

  const isApplicable = useCallback((type: RelationshipType) => {
    if (!source) return;

    if (type.targetTypeId && !target) return false;

    const getEntityTypes = (annotation: ImageAnnotation | W3CImageAnnotation) => {
      const bodies: AnnotationBody[] = annotation.bodies || (
        'body' in annotation ? 
          Array.isArray(annotation.body) ? annotation.body : [annotation.body]
        : []);

      // The entity type ID tags on this annotation
      const entityIds = bodies
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