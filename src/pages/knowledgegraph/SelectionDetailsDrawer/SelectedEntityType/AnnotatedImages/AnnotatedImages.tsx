import { useEffect, useMemo, useState } from 'react';
import { EntityType } from '@/model';
import { Graph, GraphNode } from '../../../Types';
import { AnnotatedImage } from './AnnotatedImage';

interface AnnotatedImagesProps {

  graph: Graph

  type: EntityType;

  onLoadAnnotations(count: number): void;

}

export const AnnotatedImages = (props: AnnotatedImagesProps) => {

  const { graph, type } = props;

  const annotatedImages = useMemo(() => (
    [...graph.getLinkedNodes(type.id).filter(n => n.type === 'IMAGE')]
      .sort((a, b) => a.label.localeCompare(b.label))
  ), [type]);

  const [annotations, setAnnotations] = useState<Record<string, number>>({});

  useEffect(() => setAnnotations({}), [type]);

  const onLoadAnnotations = (image: GraphNode, count: number) => {
    if (annotations[image.id] !== count) {
      setAnnotations(current => ({...current, [image.id]: count }));
    }
  }

  useEffect(() => {
    const total = Object.values(annotations).reduce((total, c) => total + c, 0);
    props.onLoadAnnotations(total);
  }, [annotations])

  return (
    <div>
      {annotatedImages.map(image => (
        <AnnotatedImage 
          key={image.id}
          node={image}
          entityType={type} 
          onLoadAnnotations={count => onLoadAnnotations(image, count)} />
      ))}
    </div>
  )

}