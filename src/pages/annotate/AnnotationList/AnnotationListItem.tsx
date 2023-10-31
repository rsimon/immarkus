import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { EntityBadge } from '@/components/EntityBadge';
import { useVocabulary } from '@/store';

interface AnnotationListItemProps {

  annotation: ImageAnnotation;

}

export const AnnotationListItem = (props: AnnotationListItemProps) => {

  const tags: W3CAnnotationBody[] = props.annotation.bodies.filter(b => b.purpose === 'classifying');

  const { getEntity } = useVocabulary();

  return (
    <ul className="flex flex-wrap">
      {tags.map(tag => (
        <li key={tag.id} className="inline-block mr-1 mb-1 whitespace-nowrap">
          <EntityBadge 
            entity={getEntity(tag.source)} />
        </li>
      ))}
    </ul>
  )

}