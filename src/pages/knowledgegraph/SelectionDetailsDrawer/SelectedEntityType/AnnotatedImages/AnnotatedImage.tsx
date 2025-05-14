import { useEffect, useState } from 'react';
import { Image, SquareArrowOutUpRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { W3CAnnotation, W3CImageAnnotation } from '@annotorious/react';
import { AnnotationValuePreview } from '@/components/AnnotationValuePreview';
import { EntityType, LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { GraphNode } from '../../../Types';
import { AnnotationThumbnail } from '../../AnnotationThumbnail';
import { Skeleton } from '@/ui/Skeleton';

interface LazyAnnotatedImageProps extends AnnotatedImageProps {

  annotations: W3CImageAnnotation[];

}

const LazyLoadingAnnotatedImage = (props: LazyAnnotatedImageProps) => {

  const { node } = props;

  const loadedImage = useImages(node.id) as LoadedImage;

  const getEntityBodies = (annotation: W3CImageAnnotation) => {
    const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    return bodies.filter(b => b.source === props.entityType.id);
  }

  return (
    <article className="bg-white shadow-xs rounded border mt-1.5">
      <div className="flex justify-between items-center p-1 pl-3">
        <h3 className="flex gap-1.5 pr-1 items-center text-xs whitespace-nowrap overflow-hidden">
          <Image className="h-3.5 w-3.5" />
          <span className="overflow-hidden text-ellipsis">{node.label}</span>
        </h3>

        <Button
          asChild
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0">
          <a href={`#/annotate/${node.id}`}><SquareArrowOutUpRight className="h-3.5 w-3.5" /></a>
        </Button>
      </div>      

      <ul>
        {props.annotations.map(annotation => (
          <li
            key={annotation.id}
            className="border-t p-2.5">
            <div className="flex items-start w-full">
              <div className="shrink-0">
                {loadedImage && (
                  <AnnotationThumbnail
                    annotation={annotation}
                    className="w-20 h-20 bg-muted" 
                    image={loadedImage} /> 
                )}
              </div>

              <AnnotationValuePreview
                className="text-xs text-muted-foreground font-light pl-2.5 grow shrink line-clamp-3 leading-relaxed overflow-hidden"
                bodies={getEntityBodies(annotation)} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  )

}

interface AnnotatedImageProps {

  entityType: EntityType;

  node: GraphNode;

  onLoadAnnotations(count: number): void;

}

export const AnnotatedImage = (props: AnnotatedImageProps) => {
  
  const { node, entityType } = props;

  const store = useStore();

  const [annotations, setAnnotations] = useState<W3CImageAnnotation[]>([]);

  const { ref, inView } = useInView();

  const setForThisType = (annotations: W3CAnnotation[]) => {
    const forThisType = annotations.filter(a => {
      const bodies = Array.isArray(a.body) ? a.body : [a.body];
      return bodies.some(b => b.source === entityType.id);
    }) as W3CImageAnnotation[];

    setAnnotations(forThisType);

    setTimeout(() => 
      props.onLoadAnnotations(forThisType.length), 1);
  }

  useEffect(() => {
    store.getAnnotations(node.id, { type: 'image' }).then(setForThisType);
  }, [node, entityType]);

  return (
    <div ref={ref}>
      {inView ? (
        <LazyLoadingAnnotatedImage 
          {...props} 
          annotations={annotations} />
      ) : (
        <Skeleton className="h-20 w-full" />
      )}
    </div>
  )

}