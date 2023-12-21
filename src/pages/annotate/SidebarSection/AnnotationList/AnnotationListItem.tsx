import TimeAgo from 'timeago-react';
import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { EntityBadge } from '@/components/EntityBadge';
import { useDataModel } from '@/store';
import { AnnotationListItemActions } from './AnnotationListItemActions';

interface AnnotationListItemProps {

  annotation: ImageAnnotation;

  onSelect(): void;

  onDelete(): void;

}

export const AnnotationListItem = (props: AnnotationListItemProps) => {

  const { getEntityType } = useDataModel();

  const note = props.annotation.bodies.find(b => b.purpose === 'commenting');

  const tags: W3CAnnotationBody[] = props.annotation.bodies.filter(b => b.purpose === 'classifying');

  const isEmpty = !note && tags.length === 0;

  const timestamps = props.annotation.bodies
    .map(b => b.created)
    .filter(Boolean)
    .map(d => new Date(d))
    .slice().sort();

  const lastEdit = timestamps.length > 0 ? timestamps[timestamps.length - 1] : undefined;

  return (
    <div className="relative border mb-2 rounded shadow-sm px-2 pt-2.5 pb-2 bg-white">
      {tags.length > 0 && (
        <ul 
          className="line-clamp-1 mr-8"
          style={{ textOverflow: 'foo' }}>
          {tags.map(tag => (
            <li key={tag.id} className="inline-block mr-1 mb-1 whitespace-nowrap">
              <EntityBadge 
                entityType={getEntityType(tag.source)} />
            </li>
          ))}
        </ul>
      )}
    
      {note && (
        <p className={tags.length > 0 ? 'line-clamp-1 pl-1 pr-8 pt-1.5 pb-1' : 'line-clamp-2 pl-1 pr-5 pt-1 pb-0.5'}>
          {note.value}
        </p>
      )}

      {isEmpty && (
        <div className="pt-3.5 pb-3 flex justify-center text-muted-foreground">
          Empty annotation
        </div>
      )}

      {lastEdit && (
        <div className="text-xs text-muted-foreground/80 px-1 pt-1">
          <TimeAgo datetime={lastEdit} />
        </div>
      )}

      <AnnotationListItemActions 
        onSelectAnnotation={props.onSelect} 
        onDeleteAnnotation={props.onDelete} />
    </div>
  )

}