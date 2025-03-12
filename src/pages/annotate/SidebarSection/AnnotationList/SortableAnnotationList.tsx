import { useCallback, useEffect, useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
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

  annotations: ImageAnnotation[];

  onEdit(annotation: ImageAnnotation): void;

  onDelete(annotation: ImageAnnotation): void

}

export const SortableAnnotationList = (props: SortableAnnotationListProps) => {

  const [activeId, setActiveId] = useState(null);

  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(props.annotations.map(a => a.id));
  }, [props.annotations]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id.valueOf() as string);
        const newIndex = items.indexOf(over.id.valueOf() as string);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }

  const renderSortableItem = (id: string, not: boolean) => {
    const annotation = props.annotations.find(a => a.id === id);

    return (
      <SortableAnnotationListItem
        key={id}
        isActive={not && id === activeId}
        annotation={annotation}
        onEdit={() => props.onEdit(annotation)}
        onDelete={() => props.onDelete(annotation)} />
    )
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <SortableContext 
        items={items}
        strategy={verticalListSortingStrategy}>
        {items.map(i => renderSortableItem(i, true))}
      </SortableContext>

      <DragOverlay>
        {activeId ? renderSortableItem(activeId, false) : null}
      </DragOverlay>
    </DndContext>
  )

}