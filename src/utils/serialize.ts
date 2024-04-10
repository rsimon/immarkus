import React from 'react';
import { PropertyDefinition } from '@/model';

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
