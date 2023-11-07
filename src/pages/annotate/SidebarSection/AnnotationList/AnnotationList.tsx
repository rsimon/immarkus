import { ImageAnnotation, useAnnotations, useAnnotator } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';

export const AnnotationList = () => {

  const anno = useAnnotator();

  const annotations = useAnnotations<ImageAnnotation>();

  const onSelect = (annotation: ImageAnnotation) => () =>
    anno.setSelected(annotation.id);

  return (
    <div className="py-4 text-sm grow">
      <ul>
        {annotations.map(annotation => (
          <li key={annotation.id} onClick={onSelect(annotation)}>
            <AnnotationListItem annotation={annotation} />
          </li>
        ))}
      </ul>
    </div>
  )

}