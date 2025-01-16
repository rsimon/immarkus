import { InternationalString } from '@iiif/presentation-3';

export const getPropertyValue = <T extends unknown = any>(data: any, name: string) => {
  let prop: any = data[name];

  if (!prop)
    prop = data[`@${name}`];

  return prop as T;
}

export const getStringValue = (propertyValue: string | InternationalString, locale = 'en') => {
  if (typeof propertyValue === 'string') return propertyValue;

  const localized = propertyValue[locale];
  if (localized) {
    return localized[0];
  } else {
    const values = Object.values(propertyValue).reduce<string[]>((flattened, value) => {
      return Array.isArray(value) ? [...flattened, ...value] : [...flattened, value]
    }, []);

    return values.length > 0 ? values[0] : undefined;
  }
}

export const getLabel = (data: any, locale = 'en') => {
  const propertyValue = getPropertyValue<string | InternationalString>(data, 'label');
  return getStringValue(propertyValue, locale);
} 
