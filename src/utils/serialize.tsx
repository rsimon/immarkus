import { PropertyDefinition } from '@/model';


export const serializePropertyValue = (definitionOrType: PropertyDefinition | string, value?: any): string => {
  if (!value)
    return '';

  const type = typeof definitionOrType === 'string' ? definitionOrType : definitionOrType.type;

  if (type === 'measurement')
    return `${value.value} ${value.unit}`;
  else if (type === 'geocoordinate')
    return `${value[0]}/${value[1]}`;
  else if (type === 'relation')
    return value.instance
  else
    return value.toString();
}

