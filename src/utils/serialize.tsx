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

