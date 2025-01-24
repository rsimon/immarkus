import { InternationalString, MetadataItem } from '@iiif/presentation-3';
import { CozyMetadata } from '../Types';

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

export const getLabel = (data: any) => (locale = 'en') => {
  const propertyValue = getPropertyValue<string | InternationalString>(data, 'label');
  return propertyValue ? getStringValue(propertyValue, locale) : undefined;
} 

export const getMetadata = (data: any) => (locale?: string): CozyMetadata[] => {
  const metadata = getPropertyValue(data, 'metadata') as MetadataItem[];
  if (!metadata) return [];

  return metadata.map(({ label, value }) => ({
    label: getStringValue(label, locale),
    value: getStringValue(value, locale)
  }));
}