import { AnnotationValuePreview } from '@/components/AnnotationValuePreview';
import { EntityBadge } from '@/components/EntityBadge';
import { ExternalAuthority } from '@/model';
import { useDataModel } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';

interface AnnotationsTabItemProps {

  annotation: W3CAnnotation;

  authorities: ExternalAuthority[];

}

export const AnnotationsTabItem = (props: AnnotationsTabItemProps) => {

  const { getEntityType } = useDataModel();

  const bodies = Array.isArray(props.annotation.body)
    ? props.annotation.body 
    : [props.annotation.body];

  const entityTags = bodies.filter((b: W3CAnnotationBody) => 
    b.purpose === 'classifying') as unknown as W3CAnnotationBody[];

  return (
    <div className="border rounded mb-2 p-2 shadow-ms">
      {entityTags.length > 0 && (
        <ul 
          className="line-clamp-1 mr-8">
          {entityTags.map(tag => (
            <li key={tag.id} className="inline-block mr-1 mb-1 whitespace-nowrap">
              <EntityBadge 
                entityType={getEntityType(tag.source)} />
            </li>
          ))}
        </ul>
      )}

      <div className="px-0.5 text-xs">
        <AnnotationValuePreview bodies={entityTags} />
      </div>
    </div>
  )

}