import { EntityBadge } from '@/components/EntityBadge';
import { ExternalAuthority } from '@/model';
import { useDataModel } from '@/store';
import { useValuePreviews } from '@/utils/useValuePreviews';
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

  const valuePreviews = useValuePreviews(bodies);

  return (
    <div>
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

      {valuePreviews.map((node, idx) =>
        <span key={`n-${idx}`}>{node} {(idx < valuePreviews.length - 1) && ' · '}</span>
      )}
    </div>
  )

}