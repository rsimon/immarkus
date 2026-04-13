import { ReactNode, useMemo } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { ExternalAuthority, PropertyDefinition } from '@/model';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { useDataModel } from '@/store';
import { formatIdentifier, expandIdentifier} from '@/components/PropertyFields/ExternalAuthorityField/util';
import { serializePropertyValue } from '@/utils/serialize';

interface AnnotationValuePreviewProps {

  className?: string;

  bodies: W3CAnnotationBody[];

}

const getValuePreviews = (
  schema: PropertyDefinition[], 
  body: W3CAnnotationBody, 
  allAuthorities: ExternalAuthority[]
) => {
  if ('properties' in body) {
    return schema.reduce<ReactNode[]>((previews, definition) => {
      const value = body.properties[definition.name];

      const authorities = definition.type === 'external_authority' 
        ? allAuthorities.filter(a => (definition.authorities || []).includes(a.name))
        : [];

      if (value) {
        const serialized = serializePropertyValue(definition, value);

        const nodes = serialized.map(str => {
          if (definition.type === 'uri') {
            return (
              <a href={str} target="_blank" className="text-sky-700 hover:underline">{str}</a>
            );
          } else if (definition.type === 'external_authority') {
            const expanded = expandIdentifier(str, authorities);
            const isURI = expanded ? /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(expanded) : false;

            return isURI ? (
              <a href={expanded} target="_blank" className="text-sky-700 hover:underline">
                {formatIdentifier(str, authorities)}
              </a>
            ) : str;
          } else {
            return (<span>{str}</span>)
          }
        });

        return [...previews, ...nodes];
      } else {
        return previews;
      }
    }, []);
  } else {
    return [];  
  }
}

export const AnnotationValuePreview = (props: AnnotationValuePreviewProps) => {

  const { getEntityType } = useDataModel();

  const { authorities } = useRuntimeConfig();

  const previews = useMemo(() => {
    const entityTags = props.bodies.filter(b => b.purpose === 'classifying');

    return entityTags.reduce<ReactNode[]>((values, body) => {
      const schema = getEntityType(body.source, true);
      if (schema) {
        return [...values, ...getValuePreviews(schema.properties || [], body, authorities)];
      } else {
        console.error('Reference to missing entity class:', body.source);
        return values;
      }
    }, []);
  }, [props.bodies]);

  return (
    <div className={props.className}>
      {previews.map((node, idx) => (
        <span 
          key={`n-${idx}`}>
          {node} {(idx < previews.length - 1) && ' · '}
        </span>
      ))}
    </div>
  )

}
