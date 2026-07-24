import { Store } from '@/store';
import { W3CAnnotationBody } from '@annotorious/react';

export const crosswalkMetadata = (metadata: W3CAnnotationBody, store: Store) => {
  const source = metadata['source'];
  const properties = metadata['properties'];

  if (!source || !properties || typeof properties !== 'object')
    return {};

  const schema = store.getDataModel().getImageSchema(source);
  if (!schema) return {};

  console.log(metadata, schema);

  return {};

}