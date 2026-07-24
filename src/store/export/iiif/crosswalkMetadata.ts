import { Store } from '@/store';
import { W3CAnnotationBody } from '@annotorious/react';
import { serializePropertyValue } from '@/utils/serialize';

// Basic helper shape
export interface IIIFMetadataField {

  label: { en: string[] };

  value: { en: string[] };

}

export const crosswalkMetadata = (metadata: W3CAnnotationBody, store: Store) => {
  const source = metadata['source'];
  const properties = metadata['properties'];

  if (!source || !properties || typeof properties !== 'object')
    return {};

  const schema = store.getDataModel().getImageSchema(source);
  if (!schema) return {};

  const entries = (schema.properties || []).reduce<IIIFMetadataField[]>((entries, definition) => {
    const values = serializePropertyValue(definition, properties[definition.name]);
    if (values.length === 0) return entries;

    return [...entries, {
      label: { en: [definition.name] },
      value: { en: values }
    }];
  }, []);

  return entries.length > 0 ? { metadata: entries } : {};
}