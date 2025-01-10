import { useEffect, useState } from 'react';
import { Image, SquareArrowOutUpRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { W3CAnnotation, W3CImageAnnotation } from '@annotorious/react';
import { AnnotationValuePreview } from '@/components/AnnotationValuePreview';
import { EntityType, LoadedImage } from '@/model';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { GraphNode } from '../../../Types';
import { AnnotationThumbnail } from '../../AnnotationThumbnail';
import { parseIIIFId } from '@/utils/iiif/utils';

interface AnnotatedImageProps {

  entityType: EntityType;

  node: GraphNode;

  onLoadAnnotations(count: number): void;

}

export const AnnotatedImage = (props: AnnotatedImageProps) => {

  const { node, entityType } = props;

  const { ref, inView } = useInView();

  const store = useStore();

  const [loadedImage, setLoadedImage] = useState<LoadedImage | undefined>();

  const [annotations, setAnnotations] = useState<W3CImageAnnotation[]>([]);

  const setForThisType = (annotations: W3CAnnotation[]) => {
    const forThisType = annotations.filter(a => {
      const bodies = Array.isArray(a.body) ? a.body : [a.body];
      return bodies.some(b => b.source === entityType.id);
    }) as W3CImageAnnotation[];

    setAnnotations(forThisType);

    props.onLoadAnnotations(forThisType.length);
  }

  useEffect(() => {
    if (node.id.startsWith('iiif:')) {
      store.getCanvasAnnotations(node.id).then(setForThisType);
    } else {
      store.getAnnotations(node.id, { type: 'image' }).then(setForThisType);
    }
  }, [node, entityType]);

  useEffect(() => {
    if (!inView) return;

    if (node.id.startsWith('iiif:')) {
      // TODO
    } else {
      store.loadImage(node.id).then( setLoadedImage);
    }
  }, [node, inView, store]);

  const getEntityBodies = (annotation: W3CImageAnnotation) => {
    const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    return bodies.filter(b => b.source === props.entityType.id);
  }

  return (
    <article
      ref={ref} 
      className="bg-white shadow-sm rounded border mt-1.5">

      <div className="flex justify-between items-center p-1 pl-3">
        <h3 className="flex gap-1.5 pr-1 items-center text-xs whitespace-nowrap overflow-hidden">
          <Image className="h-3.5 w-3.5" />
          <span className="overflow-hidden text-ellipsis">{node.label}</span>
        </h3>

        <Button
          asChild
          size="icon"
          variant="ghost"
          className="h-8 w-8 flex-shrink-0">
          <a href={`#/annotate/${node.id}`}><SquareArrowOutUpRight className="h-3.5 w-3.5" /></a>
        </Button>
      </div>      

      <ul>
        {loadedImage && annotations.map(annotation => (
          <li 
            key={annotation.id}
            className="border-t p-2.5">
            <div className="flex items-start w-full">
              <div className="flex-shrink-0">
                <AnnotationThumbnail
                  annotation={annotation}
                  className="w-20 h-20 bg-muted" 
                  image={loadedImage} /> 
              </div>

              <AnnotationValuePreview
                className="text-xs text-muted-foreground font-light pl-2.5 flex-grow flex-shrink line-clamp-3 leading-relaxed overflow-hidden"
                bodies={getEntityBodies(annotation)} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  )

}