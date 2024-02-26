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

export const AnnotationList = () => {

  const manifold = useAnnotoriousManifold();

  const annotations = useAnnotations<ImageAnnotation>();

  const store = useStore();

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

  return imageIds.length === 1 ? (
    <div className="py-2 grow">
      <ul>
        {annotations.get(imageIds[0]).map(annotation => (
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
          <AccordionTrigger className="text-xs font-medium mb-2">
            {store.getImage(source).name}
          </AccordionTrigger>

          <AccordionContent>
            <ul>
              {annotations.get(source).map(annotation => (
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
  )

}