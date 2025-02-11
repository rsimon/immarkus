import { W3CAnnotationBody, W3CImageAnnotation } from '@annotorious/react';
import { AnnotationValuePreview } from '@/components/AnnotationValuePreview';
import { EntityBadge } from '@/components/EntityBadge';
import { ExternalAuthority, LoadedImage } from '@/model';
import { useDataModel } from '@/store';
import { AnnotationThumbnail } from '../../AnnotationThumbnail';

interface AnnotationCardProps {

  annotation: W3CImageAnnotation;

  authorities: ExternalAuthority[];

  image: LoadedImage;

}

export const AnnotationCard = (props: AnnotationCardProps) => {

  const { getEntityType } = useDataModel();

  const bodies = Array.isArray(props.annotation.body)
    ? props.annotation.body 
    : [props.annotation.body];

  const entityTags = bodies.filter((b: W3CAnnotationBody) => 
    b.purpose === 'classifying') as unknown as W3CAnnotationBody[];

  return (
    <div className="bg-white border rounded shadow-xs p-2.5">
      <div className="flex gap-2">
        <div className="shrink-0">
          <AnnotationThumbnail
            annotation={props.annotation}
            className="w-20 h-20 bg-muted" 
            image={props.image} /> 
        </div>

        <div className="py-0.5 shrink overflow-hidden">
          {entityTags.length > 0 && (
            <ul className="line-clamp-1">
              {entityTags.map(tag => (
                <li 
                  key={tag.id} 
                  className="inline-block mr-1 mb-1 whitespace-nowrap">
                  <EntityBadge entityType={getEntityType(tag.source)} />
                </li>
              ))}
            </ul>
          )}

          <div className="px-0.5 text-xs font-light text-muted-foreground">
            <AnnotationValuePreview 
              bodies={entityTags} 
              className="line-clamp-2 overflow-hidden" />
          </div>
        </div>
      </div>
    </div>
  )

}