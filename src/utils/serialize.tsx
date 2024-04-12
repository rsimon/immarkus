import { ReactNode } from 'react';
import { ExternalAuthority, PropertyDefinition } from '@/model';
import { W3CAnnotationBody } from '@annotorious/react';
import { formatIdentifier } from '@/components/PropertyFields/ExternalAuthorityField/util';

export const serializePropertyValue = (definition: PropertyDefinition, value?: any): string => {
  if (!value)
    return '';

  if (definition.type === 'measurement')
    return `${value.value} ${value.unit}`;
  else if (definition.type === 'geocoordinate')
    return `${value[0]}/${value[1]}`;
  else if (definition.type === 'relation')
    return value.instance
  else
    return value.toString();
}

export const getValuePreviews = (
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
