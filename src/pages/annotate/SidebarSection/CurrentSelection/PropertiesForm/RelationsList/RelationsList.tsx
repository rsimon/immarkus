import { useCallback, useMemo } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { useStore } from '@/store';
import { Separator } from '@/ui/Separator';
import { RelationsListItem } from './RelationsListItem';
import { RelationshipType } from '@/model';

interface RelationsListProps {

  annotation: ImageAnnotation;

}

export const RelationsList = (props: RelationsListProps) => {

  const store = useStore();

  const relations = useMemo(() => (
    store.getRelatedAnnotations(props.annotation.id)
  ), [props.annotation.id, store]);

  const onChangeRelationshipType = useCallback((meta: W3CRelationMetaAnnotation, type: RelationshipType) => {
    const next = {
      ...meta,
      body: { value: type.name }
    };
    
    store.upsertRelation(undefined, next);
  }, [store]);

  const onDeleteRelation = useCallback((link: W3CRelationLinkAnnotation) => {
    // Note that this will automatically delete link AND meta
    store.deleteRelation(link.id)
  }, [store]);

  return (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 pt-4 pb-1 items-center">
        <span>Related Annotations</span>
      </h3>

      <ul>
        {relations.map(([link, meta]) => (
          <li key={link.id}>
            <RelationsListItem
              leftSideId={props.annotation.id}
              sourceId={link.target}
              targetId={link.body}
              relationship={meta.body?.value} 
              onChangeRelationship={t => onChangeRelationshipType(meta, t)}
              onDelete={() => onDeleteRelation(link)} />
          </li>
        ))}
      </ul>

      <Separator className="mt-3" />
    </div>
  )

}