import { W3CAnnotation } from '@annotorious/react';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { AnnotationsTabItem } from './AnnotationsTabItem';

interface AnnotationsTabProps {

  annotations: W3CAnnotation[];

}

export const AnnotationsTab = (props: AnnotationsTabProps) => {

  const { authorities } = useRuntimeConfig();

  return (
    <div>
      {props.annotations.map(annotation => (
        <AnnotationsTabItem 
          key={annotation.id}
          annotation={annotation}
          authorities={authorities} />
      ))}
    </div>
  )

}