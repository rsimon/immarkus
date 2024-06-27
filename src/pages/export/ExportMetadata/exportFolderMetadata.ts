import { W3CAnnotationBody } from '@annotorious/react';
import { Store } from '@/store';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';
import { downloadCSV } from '@/utils/download';

export const exportFolderMetadataCSV = async (store: Store) => {
  const { folders } = store;
  const { folderSchemas } = store.getDataModel();

  const columns = aggregateSchemaFields(folderSchemas);

  Promise.all(folders.map(folder => store.getFolderMetadata(folder.id).then(metadata => ({ folder, metadata }))))
    .then(results => results.map(({ folder, metadata }) => {
      const entries = zipMetadata(columns, metadata?.body as W3CAnnotationBody);
      return Object.fromEntries([['folder', folder.name], ...entries]);
    }))
    .then(rows => downloadCSV(rows, 'folder_metadata.csv'));
}