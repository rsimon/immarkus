import { W3CAnnotation } from '@annotorious/react';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { AnnotationsTabItem } from './AnnotationsTabItem';

interface AnnotationsTabProps {

  annotations: W3CAnnotation[];

}

export const AnnotationsTab = (props: AnnotationsTabProps) => {

  const { authorities } = useRuntimeConfig();

  return (
    <ul>
      {props.annotations.map(annotation => (
        <li className="border rounded mb-2 p-2">
          <AnnotationsTabItem 
            key={annotation.id}
            annotation={annotation}
            authorities={authorities} />
        </li>
      ))}
    </ul>
  )

}