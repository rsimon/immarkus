import { useCallback, useMemo, useState } from 'react';
import { ImageAnnotation, AnnotoriousOpenSeadragonAnnotator } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';
import { useAnnotations, useAnnotoriousManifold } from '@annotorious/react-manifold';
import { useStore } from '@/store';
import { SelectFilter } from './SelectFilter';
import { DEFAULT_SORTING, SelectSortOrder } from './SelectSortOrder';
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

  const store = useStore();

  const annotations = useAnnotations<ImageAnnotation>();

  const flattened = useMemo(() => Array.from(annotations.values())
    .reduce<ImageAnnotation[]>((all, annotations) => ([...all, ...annotations]), []), [annotations]);

  const [sorting, setSorting] = useState<((a: ImageAnnotation, b: ImageAnnotation) => number) | undefined>(
    () => DEFAULT_SORTING
  );

  const [filter, setFilter] = useState<((a: ImageAnnotation) => boolean) | undefined>();

  const onEdit = (annotation: ImageAnnotation) => () => {
    manifold.setSelected(annotation.id);

    const annotator = manifold.findAnnotator(annotation.id);
    (annotator as AnnotoriousOpenSeadragonAnnotator).fitBounds(annotation, { padding: 200});

    props.onEdit();
  }

  const onDelete = (annotation: ImageAnnotation) => () =>
    manifold.deleteAnnotation(annotation.id);

  const imageIds = Array.from(annotations.keys());

  const entityTypes = useMemo(() => { 
    const sources = new Set(flattened.reduce<string[]>((all, annotation) => {
      const sources = annotation.bodies
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
      : annotations.get(imageId).filter(a => a.target.selector);

    return sorting ? filtered.slice().sort(sorting) : filtered;
  }, [filter, sorting, annotations]);

  return (
    <div className="py-3 px-2 bg-slate-100/50 grow h-full">
      <div className="text-xs text-muted-foreground flex justify-between mb-1 px-1.5">
        <SelectSortOrder 
          onSelect={sorting => setSorting(() => sorting)} />

        <SelectFilter 
          entityTypes={entityTypes}
          relationshipNames={relationshipNames}
          onSelect={filter => setFilter(() => filter)} />
      </div>

      <div>
        {imageIds.length === 1 ? (
          <div className="py-2 grow">
            <ul className="space-y-2">
              {listAnnotations(imageIds[0]).map(annotation => (
                <li key={annotation.id}>
                  <AnnotationListItem 
                    annotation={annotation} 
                    onEdit={onEdit(annotation)}
                    onDelete={onDelete(annotation)} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Accordion className="py-2 grow" type="multiple">
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
                  <ul className="space-y-2">
                    {listAnnotations(sourceId).map(annotation => (
                      <li key={annotation.id}>
                        <AnnotationListItem 
                          annotation={annotation} 
                          onEdit={onEdit(annotation)}
                          onDelete={onDelete(annotation)} />
                      </li>
                    ))}
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