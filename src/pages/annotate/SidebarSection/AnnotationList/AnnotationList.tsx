import { type MouseEvent, useCallback, useMemo, useState } from 'react';
import { Move } from 'lucide-react';
import { AnnotoriousOpenSeadragonAnnotator, W3CImageAnnotation } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';
import { useAnnotoriousManifold, useSelection } from '@annotorious/react-manifold';
import { useStore } from '@/store';
import { Separator } from '@/ui/Separator';
import { SelectFilter } from './SelectFilter';
import { SortableAnnotationList } from './sortable';
import { SelectAll } from './SelectAll';
import { DEFAULT_SORTING, SelectListOrder } from './SelectListOrder';
import { useSortableAnnotations } from './useSortableAnnotations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';

interface AnnotationListProps {

  onEdit(): void;

}

export const AnnotationList = (props: AnnotationListProps) => {

  const manifold = useAnnotoriousManifold();

  const { selected } = useSelection();

  const store = useStore();

  const [accordionState, setAccordionState] = useState<string[]>([]);

  const { annotations, updateOrder } = useSortableAnnotations();

  const [sorting, setSorting] = useState<((a: W3CImageAnnotation, b: W3CImageAnnotation) => number) | undefined>(
    () => DEFAULT_SORTING
  );

  const flattened = useMemo(() => Array.from(annotations.values())
    .reduce<W3CImageAnnotation[]>((all, annotations) => ([...all, ...annotations]), []), [annotations]);

  const [filter, setFilter] = useState<((a: W3CImageAnnotation) => boolean) | undefined>();

  const onEdit = (annotation: W3CImageAnnotation) => {
    manifold.setSelected(annotation.id);

    const annotator = manifold.findAnnotator(annotation.id);
    (annotator as AnnotoriousOpenSeadragonAnnotator).fitBounds(annotation, { padding: 200});

    props.onEdit();
  }

  const onDelete = (annotation: W3CImageAnnotation) =>
    manifold.deleteAnnotation(annotation.id);

  const imageIds = Array.from(annotations.keys());

  const entityTypes = useMemo(() => { 
    const sources = new Set(flattened.reduce<string[]>((all, annotation) => {
      const sources = (Array.isArray(annotation.body) ? annotation.body : [annotation.body])
        .filter(b => b.purpose === 'classifying' && 'source' in b)
        .map(b => (b as any).source);

      return [...all, ...sources];
    }, []));

    const datamodel = store.getDataModel();

    return Array.from(sources)
      .map(id => datamodel.getEntityType(id)).filter(Boolean)
      .slice().sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));
  }, [store, flattened]);

  const relationshipNames: string[] = useMemo(() => {
    const relationshipNames = flattened.reduce<string[]>((all, annotation) => {
      const meta = store.getRelatedAnnotations(annotation.id)
        .map(t => t[1]).filter(m => m?.body?.value);

      return [...all, ...meta.map(m => m.body.value)];
    }, []);

    return [...new Set(relationshipNames)];
  }, [flattened]);

  const listAnnotations = useCallback((imageId: string) => {
    const filtered = filter 
      ? annotations.get(imageId).filter(filter)
      : annotations.get(imageId).filter(a => 'selector'  in (a as any).target);

    return sorting ? filtered.slice().sort(sorting) : filtered;
  }, [filter, sorting, annotations]);

  const canSelectAll = useMemo(() => {
    if (imageIds.length === 1) {
      return listAnnotations(imageIds[0]).length > 0;
    } else {
      return accordionState.reduce((visible, imageId) => {
        return visible + listAnnotations(imageId).length;
      }, 0) > 0;
    }
  }, [imageIds, accordionState, listAnnotations])

  const isSelected = (annotation: W3CImageAnnotation) =>
    selected.some(s => s.annotation.id === annotation.id);

  const onSelectAll = () => {
    const activeIds = imageIds.length === 1 ? imageIds : accordionState;
    const toSelect = activeIds.flatMap(id => listAnnotations(id)).map(a => a.id);
    manifold.setSelected(toSelect);
  }

  const onListClick = (evt: MouseEvent) => {
    // If the container (not a list item) was clicked, deselect all
    if (evt.target === evt.currentTarget)
      manifold.setSelected([]);
  }

  return (
    <div 
      className="py-3 px-2 bg-slate-100/50 grow h-full" 
      onClick={onListClick}>
      <div className="text-xs text-muted-foreground flex justify-between mb-1 px-1.5">
        <div>
          <SelectListOrder 
            onChangeOrdering={sorting => setSorting(() => sorting)} />
        </div>

        <div className="flex items-center">
          <SelectFilter 
            entityTypes={entityTypes}
            relationshipNames={relationshipNames}
            onSelectFilter={filter => setFilter(() => filter)} />

          <Separator 
            orientation="vertical" 
            className="ml-1" />

          <SelectAll 
            disabled={!canSelectAll}
            onSelectAll={onSelectAll}/>
        </div>
      </div>

      {!sorting && (
        <div className="px-1.5 py-3 border border-dashed border-slate-300/50 rounded mt-2.5 mb-1 text-muted-foreground/80 text-xs flex justify-center">
          <span className="flex gap-1.5">
            <Move className="size-3.5 mt-px" /> Drag cards to change order
          </span>
        </div>
      )}

      <div>
        {imageIds.length === 1 ? (
          <div className="py-2 grow">
            <ul className="space-y-2">
              {sorting ? (listAnnotations(imageIds[0]).map(annotation => (
                <li key={annotation.id}>
                  <AnnotationListItem 
                    annotation={annotation} 
                    isSelected={isSelected(annotation)}
                    onEdit={() => onEdit(annotation)}
                    onDelete={() => onDelete(annotation)} />
                </li>
              ))) : (
                <SortableAnnotationList 
                  annotations={listAnnotations(imageIds[0])} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  onUpdateOrder={a => updateOrder(imageIds[0], a)} />
              )}
            </ul> 
          </div>
        ) : (
          <Accordion 
            className="py-2 grow" 
            type="multiple"
            value={accordionState}
            onValueChange={setAccordionState}>
            {Array.from(annotations.keys()).map(sourceId => (
              <AccordionItem key={sourceId} value={sourceId}>
                <AccordionTrigger className="text-xs font-medium hover:no-underline overflow-hidden">
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis pr-1">
                    {sourceId.startsWith('iiif:') 
                      ? store.getCanvas(sourceId).name 
                      : store.getImage(sourceId).name}
                  </span>
                </AccordionTrigger>

                <AccordionContent>
                  <ul className="space-y-2 px-1 py-1">
                    {sorting ? (listAnnotations(sourceId).map(annotation => (
                      <li key={annotation.id}>
                        <AnnotationListItem 
                          annotation={annotation} 
                          isSelected={isSelected(annotation)}
                          onEdit={() => onEdit(annotation)}
                          onDelete={() => onDelete(annotation)} />
                      </li>
                    ))) : (
                      <SortableAnnotationList 
                        annotations={listAnnotations(sourceId)} 
                        onEdit={onEdit} 
                        onDelete={onDelete} 
                        onUpdateOrder={a => updateOrder(sourceId, a)} />
                    )}
                  </ul> 
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>  
        )}
      </div>
    </div>
  )

}