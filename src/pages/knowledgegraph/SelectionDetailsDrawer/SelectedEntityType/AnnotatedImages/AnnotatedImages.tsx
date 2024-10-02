import { useEffect, useMemo, useState } from 'react';
import { EntityType } from '@/model';
import { Graph } from '../../../Types';
import { AnnotatedImage } from './AnnotatedImage';

interface AnnotatedImagesProps {

  graph: Graph

  type: EntityType;

  onLoadAnnotations(count: number): void;

}

export const AnnotatedImages = (props: AnnotatedImagesProps) => {

  const { graph, type } = props;

  const annotatedImages = useMemo(() => (
    graph.getLinkedNodes(type.id).filter(n => n.type === 'IMAGE')
  ), [type]);

  const [annotations, setAnnotations] = useState(0);

  const onLoadAnnotations = (count: number) => 
    setAnnotations(c => c + count);

  useEffect(() => props.onLoadAnnotations(annotations), [annotations])

  return (
    <div>
      {annotatedImages.map(image => (
        <AnnotatedImage 
          key={image.id}
          imageId={image.id}
          entityType={type} 
          onLoadAnnotations={onLoadAnnotations} />
      ))}
    </div>
  )

}