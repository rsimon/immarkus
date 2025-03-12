import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { W3CImageAnnotation } from '@annotorious/react';
import { AnnotationListItem } from '../AnnotationListItem';

interface SortableAnnotationListItemProps {

  ghost?: boolean;

  annotation: W3CImageAnnotation;

  onEdit(): void;

  onDelete(): void;

}

export const SortableAnnotationListItem = (props: SortableAnnotationListItemProps) => {
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: props.annotation.id
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: props.ghost ? 0.3 : undefined
  };
  
  return (
    <li 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}>
      <AnnotationListItem 
        annotation={props.annotation} 
        onEdit={props.onEdit} 
        onDelete={props.onDelete} />
    </li>
  )

}