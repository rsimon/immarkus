import { W3CAnnotationBody } from '@annotorious/react';
import { getManifestMetadata, Store } from '@/store';
import { serializePropertyValue } from '@/utils/serialize';
import type { Folder, IIIFManifestResource, RootFolder } from '@/model';
import { IIIFMetadataField } from './types';

export const crosswalkMetadata = (
  metadata: W3CAnnotationBody | undefined,
  store: Store,
  type: 'IMAGE' | 'FOLDER'
): IIIFMetadataField[] => {
  const source = metadata?.['source'];
  const properties = metadata?.['properties'];

  if (!source || !properties || typeof properties !== 'object')
    return [];

  const schema = type === 'FOLDER'
    ? store.getDataModel().getFolderSchema(source)
    : store.getDataModel().getImageSchema(source);

  if (!schema) return [];

  return (schema.properties || []).reduce<IIIFMetadataField[]>((entries, definition) => {
    const values = serializePropertyValue(definition, properties[definition.name]);
    if (values.length === 0) return entries;

    return [...entries, {
      label: { en: [definition.name] },
      value: { en: values }
    }];
  }, []);
}

/** Collapses parent folder metadata for the given image or IIIF manifest **/
export const getFlattenedParentFolderMetadata = (
  folderHierarchy: (RootFolder | Folder | IIIFManifestResource)[], 
  store: Store
): Promise<IIIFMetadataField[]> => {
  // Merges two lists of IIIF metadata fields, with same-labeled fields in 'next' taking precedence
  const mergeIIIFMetadataFields = (
    current: IIIFMetadataField[],
    next: IIIFMetadataField[]
  ): IIIFMetadataField[] => {
    const nextLabels = new Set(next.map(field => field.label.en[0]));
    return [...current.filter(field => !nextLabels.has(field.label.en[0])), ...next];
  }

  return folderHierarchy.reduce<Promise<IIIFMetadataField[]>>((promise, folder) => promise.then(fields => {
    const body = 'uri' in folder
      ? getManifestMetadata(store, folder.id).then(({ metadata }) => metadata)
      : store.getFolderMetadata(folder.handle).then(annotation => {
          if (!annotation) return undefined;
          return Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
        });

    return body.then(b => mergeIIIFMetadataFields(fields, crosswalkMetadata(b, store, 'FOLDER')));
  }), Promise.resolve([]));
}
