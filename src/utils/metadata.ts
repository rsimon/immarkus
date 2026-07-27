import { W3CAnnotationBody } from '@annotorious/react';
import { Folder, IIIFManifestResource, MetadataSchema, PropertyDefinition, RootFolder } from '@/model';
import { Store } from '@/store';
import { parseIIIFId } from './iiif';
import { serializePropertyValue } from './serialize';

export interface SchemaField { schema: string, definition: PropertyDefinition };

export const aggregateSchemaFields = (schemas: MetadataSchema[]): SchemaField[] =>
  (schemas || []).reduce<SchemaField[]>((agg, schema) => (  
    [...agg, ...schema.properties.map(d => ({ schema: schema.name, definition: d }))]
  ), []);

export const zipMetadata = (columns: SchemaField[], metadata?: W3CAnnotationBody) => {
  const properties = metadata && 'properties' in metadata ? metadata.properties || {} : {};

  const entries = columns.map(column => {
    const columnValue = column.schema === metadata?.source 
      ? serializePropertyValue(column.definition, properties[column.definition.name]).join(' ')
      : '';

    return [`${column.schema}: ${column.definition.name}`, columnValue]
  });

  return entries;
}

/** Lists the parent sub-folder hierarchy for the given image or IIIF resource **/
export const getParentFolders = (
  store: Store,
  sourceId: string
): (RootFolder | Folder | IIIFManifestResource)[] => {
  const getParentFoldersRecursive = (next: Folder, hierarchy: Folder[] = []): (Folder | RootFolder)[] => {
    if (next.parent) {
      const folder = store.getFolder(next.parent);

      const isRootFolder = !('id' in folder);
      if (isRootFolder) {
        return [folder, next, ...hierarchy];
      } else {
        return getParentFoldersRecursive(folder, [next, ...hierarchy]);
      }
    } else {
      return [next, ...hierarchy];
    }
  }

  if (sourceId.startsWith('iiif')) {
    const [manifestId, _] = parseIIIFId(sourceId);
    const manifest = store.getIIIFResource(manifestId) as IIIFManifestResource;

    const folder = store.getFolder(manifest.folder);
    const isRootFolder = !('id' in folder);
    if (isRootFolder) {
      return [manifest];
    } else {
      return [...getParentFoldersRecursive(folder), manifest];
    }
  } else {
    const image = store.getImage(sourceId);
    if (image) {
      const folder = store.getFolder(image.folder);

      const isRootFolder = !('id' in folder);
      if (isRootFolder) {
        return [];
      } else {
        return getParentFoldersRecursive(folder);
      }
    } else {
      return [];
    }
  }
}