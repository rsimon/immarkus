import { W3CImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { AnnotationCard } from './AnnotationCard';
import { useMemo } from 'react';
import { getEntityTypes } from '@/utils/annotation';

interface AnnotationsProps {

  annotations: W3CImageAnnotation[];

  image: LoadedImage;

}

export const Annotations = (props: AnnotationsProps) => {

  const { authorities } = useRuntimeConfig();

  const sorted = useMemo(() => (
    [...props.annotations].sort((a, b) => {
      const typeA = getEntityTypes(a)[0] || '';
      const typeB = getEntityTypes(b)[0] || '';
      return typeA.localeCompare(typeB);
    })
  ), [props.annotations]);

  return (
    <ul className="space-y-2">
      {sorted.map(annotation => (
        <li key={annotation.id}>
          <AnnotationCard 
            annotation={annotation}
            authorities={authorities} 
            image={props.image} />
        </li>
      ))}
    </ul>
  )

}