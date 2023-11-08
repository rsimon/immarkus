import { ImageAnnotation } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';
import { useAnnotations } from '@annotorious/react-manifold';

export const AnnotationList = () => {

  const annotations = useAnnotations<ImageAnnotation>();

  const onSelect = (annotation: ImageAnnotation) => () => {
    // TODO
    // anno.setSelected(annotation.id);
  }

  return (
    <div className="py-4 text-sm grow">
      <ul>
        {Array.from(annotations.keys()).map(source => (
          <li key={source}>
            <h2>{source}</h2>
            <ul>
              {annotations.get(source).map(annotation => (
                <li key={annotation.id} onClick={onSelect(annotation)}>
                  <AnnotationListItem annotation={annotation} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )

}