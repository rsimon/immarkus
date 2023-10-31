import { ImageAnnotation, useAnnotations } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';

export const AnnotationList = () => {

  const annotations = useAnnotations<ImageAnnotation>();

  return (
    <div className="py-4 text-sm grow">
      <ul>
        {/*annotations.map(annotation => (
          <li key={annotation.id}>
            <AnnotationListItem annotation={annotation} />
          </li>
        )) */}
      </ul>
    </div>
  )

}