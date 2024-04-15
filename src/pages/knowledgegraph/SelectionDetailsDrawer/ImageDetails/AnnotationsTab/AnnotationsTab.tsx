import { W3CAnnotation } from '@annotorious/react';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { AnnotationsTabItem } from './AnnotationsTabItem';

interface AnnotationsTabProps {

  annotations: W3CAnnotation[];

}

export const AnnotationsTab = (props: AnnotationsTabProps) => {

  const { authorities } = useRuntimeConfig();

  return (
    <ul className="p-2">
      {props.annotations.map(annotation => (
        <li>
          <AnnotationsTabItem 
            key={annotation.id}
            annotation={annotation}
            authorities={authorities} />
        </li>
      ))}
    </ul>
  )

}