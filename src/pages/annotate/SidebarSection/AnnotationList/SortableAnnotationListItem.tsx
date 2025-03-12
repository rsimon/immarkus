import { ReactNode } from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { ImageAnnotation } from '@annotorious/react';
import { AnnotationListItemRelation } from './AnnotationListItemRelation';
import { AnnotationListItem } from './AnnotationListItem';

interface SortableAnnotationListItemProps {

  isActive: boolean;

  annotation: ImageAnnotation;

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
    opacity: props.isActive ? 0.3 : undefined
  };
  
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AnnotationListItem 
        annotation={props.annotation} 
        onEdit={props.onEdit} 
        onDelete={props.onDelete} />
    </li>
  );
}