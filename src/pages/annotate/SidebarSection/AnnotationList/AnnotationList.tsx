import { useMemo, useState } from 'react';
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

export const AnnotationList = () => {

  const manifold = useAnnotoriousManifold();

  const store = useStore();

  const annotations = useAnnotations<ImageAnnotation>();

  const [sorting, setSorting] = useState<((a: ImageAnnotation, b: ImageAnnotation) => number) | undefined>(
    () => DEFAULT_SORTING
  );

  const [filter, setFilter] = useState<((a: ImageAnnotation) => boolean) | undefined>();

  const onClick = (annotation: ImageAnnotation) => () => {
    const annotator = manifold.findAnnotator(annotation.id);
    (annotator as AnnotoriousOpenSeadragonAnnotator).fitBounds(annotation, { padding: 200});
  }

  const onEdit = (annotation: ImageAnnotation) => () => {
    manifold.setSelected(annotation.id);

    const annotator = manifold.findAnnotator(annotation.id);
    (annotator as AnnotoriousOpenSeadragonAnnotator).fitBounds(annotation, { padding: 200});
  }

  const onDelete = (annotation: ImageAnnotation) => () =>
    manifold.deleteAnnotation(annotation.id);

  const imageIds = Array.from(annotations.keys());

  const entityTypes = useMemo(() => { 
    const flattened = Array.from(annotations.values())
      .reduce<ImageAnnotation[]>((all, annotations) => ([...all, ...annotations]), []);

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
  }, [annotations]);

  const listAnnotations = (imageId: string) => {
    const filtered = filter 
      ? annotations.get(imageId).filter(filter)
      : annotations.get(imageId);

    return sorting ? filtered.slice().sort(sorting) : filtered;
  }

  return (
    <div>
      <div className="text-xs text-muted-foreground flex justify-between mb-1">
        <SelectSortOrder 
          onSelect={sorting => setSorting(() => sorting)} />

        <SelectFilter 
          entityTypes={entityTypes}
          onSelect={filter => setFilter(() => filter)} />
      </div>

      <div>
        {imageIds.length === 1 ? (
          <div className="py-2 grow">
            <ul>
              {listAnnotations(imageIds[0]).map(annotation => (
                <li key={annotation.id} onClick={onClick(annotation)}>
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
            {Array.from(annotations.keys()).map(source => (
              <AccordionItem key={source} value={source}>
                <AccordionTrigger className="text-xs font-medium mb-2 hover:no-underline overflow-hidden">
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis pr-1">{store.getImage(source).name}</span>
                </AccordionTrigger>

                <AccordionContent>
                  <ul>
                    {listAnnotations(source).map(annotation => (
                      <li key={annotation.id} onClick={onClick(annotation)}>
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