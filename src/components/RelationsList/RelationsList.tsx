import { useMemo } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { useStore } from '@/store';
import { AnnotationThumbnail } from '../AnnotationThumbnail';

interface RelationsListProps {

  annotation: ImageAnnotation;

}

export const RelationsList = (props: RelationsListProps) => {

  const store = useStore();

  const relations = useMemo(() => (
    store.getRelatedAnnotations(props.annotation.id)
  ), [props.annotation.id]);

  return (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 py-4 items-center">
        <span>Related</span>
      </h3>

      <ul>
        {relations.map(([link, meta]) => (
          <li key={link.id}>
            <AnnotationThumbnail annotation={link.target} /> 
            to 
            <AnnotationThumbnail annotation={link.body} />
          </li>
        ))}
      </ul>
    </div>
  )

}