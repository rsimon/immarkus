import { ReactNode } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { ExternalAuthority, PropertyDefinition } from '@/model';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { useDataModel } from '@/store';
import { serializePropertyValue } from './serialize';
import { formatIdentifier } from '@/components/PropertyFields/ExternalAuthorityField/util';

const getValuePreviews = (
  schema: PropertyDefinition[], 
  body: W3CAnnotationBody, 
  authorities: ExternalAuthority[]
) => {
  if ('properties' in body) {
    return schema.reduce<ReactNode[]>((previews, definition) => {
      const value = body.properties[definition.name];
      if (value) {
        const serialized = serializePropertyValue(definition, value);

        const node = 
          definition.type === 'uri' ? 
            (<a href={serialized} target="_blank" className="text-sky-700 hover:underline">{serialized}</a>) :
          definition.type === 'external_authority' 
            ? (<a href={value} target="_blank" className="text-sky-700 hover:underline">{formatIdentifier(value, authorities)}</a>)
            : (<span>{serialized}</span>);

        return [...previews, node ];
      } else {
        return previews;
      }
    }, []);
  } else {
    return [];  
  }
}

export const useValuePreviews = (bodies: W3CAnnotationBody[]) => {

  const { getEntityType } = useDataModel();

  const { authorities } = useRuntimeConfig();

  const entityTags = bodies.filter(b => b.purpose === 'classifying');

  return entityTags.reduce<ReactNode[]>((values, body) => {
    const schema = getEntityType(body.source, true);
    if (schema) {
      return [...values, ...getValuePreviews(schema.properties || [], body, authorities)];
    } else {
      console.error('Reference to missing entity class:', body.source);
      return values;
    }
  }, []);

}
