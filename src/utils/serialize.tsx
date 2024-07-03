import { PropertyDefinition } from '@/model';

export const serializePropertyValue = (definitionOrType: PropertyDefinition | string, value?: any): string[] => {
  if (!value)
    return [];

  const type = typeof definitionOrType === 'string' ? definitionOrType : definitionOrType.type;

  if (type === 'measurement') {
    const measurements = Array.isArray(value) ? value : [value];
    return measurements.map(v => `${value.value} ${value.unit}`);
  } else if (type === 'geocoordinate') {
    const coords = Array.isArray(value[0]) ? value : [value];
    return coords.map((c: number[]) => `${c[0]}/${c[1]}`);
  } else if (type === 'relation') {
    return [value.instance];
  } else {
    const values = Array.isArray(value) ? value : [value];
    return values.map(v => v.toString());
  }
}

