import { ImageAnnotation } from '@annotorious/react';

interface AnnotationListItemProps {

  annotation: ImageAnnotation;

}

export const AnnotationListItem = (props: AnnotationListItemProps) => {

  return (
    <div>
      {props.annotation.id}
    </div>
  )

}