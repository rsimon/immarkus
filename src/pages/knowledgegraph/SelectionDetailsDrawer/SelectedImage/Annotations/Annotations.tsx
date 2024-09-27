import { W3CImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { AnnotationCard } from './AnnotationCard';

interface AnnotationsProps {

  annotations: W3CImageAnnotation[];

  image: LoadedImage;

}

export const Annotations = (props: AnnotationsProps) => {

  const { authorities } = useRuntimeConfig();

  return (
    <ul className="space-y-2">
      {props.annotations.map(annotation => (
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