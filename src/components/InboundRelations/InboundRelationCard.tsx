import { Dot, Image, Minus, MoveLeft } from 'lucide-react';
import { ImageAnnotation, W3CImageAnnotation } from '@annotorious/react';
import { EntityBadge } from '@/components/EntityBadge';
import { RelatedAnnotation, useImageSnippet, useStore } from '@/store';
import { Skeleton } from '@/ui/Skeleton';
import { AnnotationValuePreview } from '@/components/AnnotationValuePreview';
import { Link } from 'react-router-dom';

interface InboundRelationCardProps {

  annotation: ImageAnnotation;
  
  related: RelatedAnnotation;

}

export const InboundRelationCard = (props: InboundRelationCardProps) => {

  const source = (props.annotation.target as any).source;

  const { related } = props;

  const store = useStore();

  const model = store.getDataModel();

  const snippet = useImageSnippet(related.annotation as W3CImageAnnotation);

  const bodies = Array.isArray(props.related.annotation.body)
    ? props.related.annotation.body : [props.related.annotation.body];

  return (
    <div className="relative border rounded text-xs shadow-sm px-2 py-2.5">
      <div className="flex gap-1.5 items-center mb-1">
        <Dot className="h-4 w-4" />
        <MoveLeft className="h-4 w-4" />

        <div className="text-xs italic">
          {related.relationName}
        </div>

        <Minus className="h-4 w-4" />

        <div>
          <EntityBadge entityType={model.getEntityType(related.sourceEntityType)} />
        </div>
      </div>

      <div className="max-w-full overflow-hidden ml-1 mt-3 flex gap-2.5 items-end">
        {snippet ? (
          <img
            loading="lazy"
            src={URL.createObjectURL(new Blob([snippet.data]))}
            alt={related.image.name}
            className="w-14 h-14 object-cover aspect-square rounded-sm border" />
        ) : (
          <Skeleton className="w-14 h-14 flex-shrink-0" /> 
        )}

        <div className="py-0.5 overflow-hidden">
          <AnnotationValuePreview bodies={bodies} />

          {source !== related.image.name && (
            <div className="flex items-center gap-1 text-muted-foreground pt-0.5">
              <Image className="w-3.5 h-3.5" />

              <a 
                href={`/#/annotate/${related.image.id}`}
                className="whitespace-nowrap block max-w-full overflow-hidden text-ellipsis italic text-sky-700 hover:underline">
                {related.image.name}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )

}