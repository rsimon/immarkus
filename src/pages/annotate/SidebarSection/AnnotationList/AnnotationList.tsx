import { useMemo, useState } from 'react';
import { ImageAnnotation, AnnotoriousOpenSeadragonAnnotator } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';
import { useAnnotations, useAnnotoriousManifold } from '@annotorious/react-manifold';
import { useStore } from '@/store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';
import { DEFAULT_SORTING, SelectSortOrder } from './SelectSortOrder';
import { SelectFilter } from './SelectFilter';

export const AnnotationList = () => {

  const manifold = useAnnotoriousManifold();

  const store = useStore();

  const annotations = useAnnotations<ImageAnnotation>();

  const [sorting, setSorting] = useState<((a: ImageAnnotation, b: ImageAnnotation) => number) | undefined>(
    () => DEFAULT_SORTING
  );

  // Shorthand
  const sort = (annotations: ImageAnnotation[]) => 
    sorting ? annotations.slice().sort(sorting) : annotations;

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

  return (
    <div>
      <div className="text-xs text-muted-foreground flex justify-between mb-1">
        <SelectSortOrder 
          onSelect={sorting => setSorting(() => sorting)} />
        <SelectFilter />
      </div>

      <div>
        {imageIds.length === 1 ? (
          <div className="py-2 grow">
            <ul>
              {sort(annotations.get(imageIds[0])).map(annotation => (
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
                    {sort(annotations.get(source)).map(annotation => (
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