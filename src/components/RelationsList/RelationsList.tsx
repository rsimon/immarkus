import { useMemo } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { useStore, W3CRelationMetaAnnotation } from '@/store';
import { RelationsListItem } from './RelationsListItem';
import { Separator } from '@/ui/Separator';

interface RelationsListProps {

  annotation: ImageAnnotation;

}

export const RelationsList = (props: RelationsListProps) => {

  const store = useStore();

  const relations = useMemo(() => (
    store.getRelatedAnnotations(props.annotation.id)
  ), [props.annotation.id]);

  const getRelationship = (meta: W3CRelationMetaAnnotation) =>
    // May need more edge case handling later
    meta.body?.value;

  return (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 pt-4 pb-1 items-center">
        <span>Relations</span>
      </h3>

      <ul>
        {relations.map(([link, meta]) => (
          <li key={link.id}>
            <RelationsListItem
              referenceAnnotation={props.annotation}
              fromId={link.target}
              toId={link.body}
              relationship={getRelationship(meta)} />
          </li>
        ))}
      </ul>

      <Separator className="mt-2" />
    </div>
  )

}