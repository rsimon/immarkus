import TimeAgo from 'timeago-react';
import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { EntityBadge } from '@/components/EntityBadge';
import { useVocabulary } from '@/store';

interface AnnotationListItemProps {

  annotation: ImageAnnotation;

}

export const AnnotationListItem = (props: AnnotationListItemProps) => {

  const { getEntity } = useVocabulary();

  const note = props.annotation.bodies.find(b => b.purpose === 'commenting');

  const tags: W3CAnnotationBody[] = props.annotation.bodies.filter(b => b.purpose === 'classifying');

  const timestamps = props.annotation.bodies
    .map(b => b.created)
    .filter(Boolean)
    .map(d => new Date(d))
    .slice().sort();

  const lastEdit = timestamps.length > 0 ? timestamps[timestamps.length - 1] : undefined;

  return (
    <div className="border mb-2 rounded shadow-sm px-2 pt-2.5 pb-2">
      <ul className="flex flex-wrap">
        {tags.map(tag => (
          <li key={tag.id} className="inline-block mr-1 mb-1 whitespace-nowrap">
            <EntityBadge 
              entity={getEntity(tag.source)} />
          </li>
        ))}
      </ul>
    
      {note && (
        <p className={tags.length > 0 ? 'line-clamp-1 px-1 pt-1 pb-0.5' : 'line-clamp-2 px-1 pt-1 pb-0.5'}>
          {note.value}
        </p>
      )}

      {lastEdit && (
        <div className="text-xs text-muted-foreground flex justify-end px-1 pt-1">
          <TimeAgo datetime={lastEdit} />
        </div>
      )}
    </div>
  )

}