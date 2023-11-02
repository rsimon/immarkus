import { ImageAnnotation, useAnnotations, useAnnotator } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';

export const AnnotationList = () => {

  const anno = useAnnotator();

  const annotations = useAnnotations<ImageAnnotation>();

  const onSelect = (annotation: ImageAnnotation) => () =>
    anno.setSelected(annotation.id);

  const onDelete = (annotation: ImageAnnotation) => () =>
    anno.removeAnnotation(annotation.id);

  return (
    <div className="pb-4 text-sm grow">
      <ul>
        {annotations.map(annotation => (
          <li key={annotation.id}>
            <AnnotationListItem 
              annotation={annotation} 
              onSelect={onSelect(annotation)} 
              onDelete={onDelete(annotation)} />
          </li>
        ))}
      </ul>
    </div>
  )

}