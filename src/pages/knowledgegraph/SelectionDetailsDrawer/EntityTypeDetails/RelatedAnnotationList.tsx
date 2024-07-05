import { RelatedAnnotation } from '@/store';
import { useMemo } from 'react';

interface RelatedAnnotationList {

  annotations: RelatedAnnotation[];

}

export const RelatedAnnotationList = (props: RelatedAnnotationList) => {

  // Grouped by images
  const grouped = useMemo(() => {
    return props.annotations.reduce((grouped, annotation) => {
      (grouped[annotation.image.id] = grouped[annotation.image.id] || []).push(annotation);
      return grouped;
    }, {});
  }, [props.annotations]);

  console.log(grouped);

  return null;

}