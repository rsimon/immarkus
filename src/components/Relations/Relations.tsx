import { useMemo } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { useStore } from '@/store';
import { AnnotationThumbnail } from '../AnnotationThumbnail';

interface RelationsProps {

  annotation: ImageAnnotation;

}

export const Relations = (props: RelationsProps) => {

  const store = useStore();

  const relations = useMemo(() => (
    store.getRelatedAnnotations(props.annotation.id)
  ), [props.annotation.id]);

  return (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 py-4 items-center">
        <span>Related</span>

        <ul>
          {relations.map(([link, meta]) => (
            <li key={link.id}>
              <AnnotationThumbnail annotation={link.target} /> 
              to 
              <AnnotationThumbnail annotation={link.body} />
            </li>
          ))}
        </ul>
      </h3>
    </div>
  )

}