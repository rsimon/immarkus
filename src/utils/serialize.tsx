interface PropertyDefinitionLike {

  type: string;

  name: string;

}

export const serializePropertyValue = (definition: PropertyDefinitionLike, value?: any): string[] => {
  if (!value)
    return [];

  const { type } = definition;

  if (type === 'measurement') {
    const measurements = Array.isArray(value) ? value : [value];
    return measurements.map(v => `${v.value} ${v.unit}`);
  } else if (type === 'geocoordinate') {
    const coords = Array.isArray(value[0]) ? value : [value];
    return coords.map((c: number[]) => `${c[0]}/${c[1]}`);
  } else {
    const values = Array.isArray(value) ? value : [value];
    return values.map(v => v.toString());
  }
}
