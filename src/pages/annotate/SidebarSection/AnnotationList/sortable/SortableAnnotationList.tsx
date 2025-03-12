import { useMemo, useState } from 'react';
import { W3CImageAnnotation } from '@annotorious/react';
import { SortableAnnotationListItem } from './SortableAnnotationListItem';
import {
  DndContext, 
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

interface SortableAnnotationListProps {

  annotations: W3CImageAnnotation[];

  onEdit(annotation: W3CImageAnnotation): void;

  onDelete(annotation: W3CImageAnnotation): void;

  onUpdateOrder(annotationIds: string[]): void;

}

export const SortableAnnotationList = (props: SortableAnnotationListProps) => {

  const [activeId, setActiveId] = useState<string | undefined>();

  const items = useMemo(() => (
    props.annotations.map(a => a.id)
  ), [props.annotations.map(a => a.id).join(':')]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: DragStartEvent) =>
    setActiveId(event.active.id as string);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      
      const next = arrayMove(items, oldIndex, newIndex);

      props.onUpdateOrder(next);      
    }

    setActiveId(undefined);
  }

  const renderSortableItem = (id: string, ghost?: boolean) => {
    const annotation = props.annotations.find(a => a.id === id);

    return (
      <SortableAnnotationListItem
        key={id}
        ghost={ghost}
        annotation={annotation}
        onEdit={() => props.onEdit(annotation)}
        onDelete={() => props.onDelete(annotation)} />
    )
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}>
      <SortableContext 
        items={items}
        strategy={verticalListSortingStrategy}>
        {items.map(i => renderSortableItem(i, activeId === i))}
      </SortableContext>

      <DragOverlay>
        {activeId ? renderSortableItem(activeId) : null}
      </DragOverlay>
    </DndContext>
  )

}