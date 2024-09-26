import { W3CAnnotationBody } from '@annotorious/react';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { Store } from '@/store';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';
import { downloadCSV } from '@/utils/download';
import { Folder, MetadataSchema } from '@/model';
import { serializePropertyValue } from '@/utils/serialize';
import { fitColumnWidths } from './utils';

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

const createSchemaWorksheet = (
  workbook: any, 
  schema: MetadataSchema,
  result: { folder: Folder, metadata: W3CAnnotationBody }[],
  store: Store
) => {
  const worksheet = workbook.addWorksheet(schema.name);

  const schemaProps = schema.properties || [];

  worksheet.columns = [
    { header: 'Folder Name', key: 'folder', width: 30 },
    { header: 'Parent Folder', key: 'parent', width: 30 },
    { header: 'File Path', key: 'path', width: 30 },
    ...schemaProps.map(property => ({
      header: property.name, key: `@property_${property.name}`, width: 30
    }))
  ];

  const withThisSchema = result.filter(({ metadata }) => metadata?.source === schema.name);

  withThisSchema.forEach(({ folder, metadata }) => {
    const row = {
      folder: folder.name,
      parent: folder.parent ? store.getFolder(folder.parent)?.name : '',
      path: [...folder.path.map(id => store.getFolder(id).name), folder.name].join('/')
    };

    const properties = 'properties' in metadata ? metadata.properties : {};

    schemaProps.forEach(d => 
      row[`@property_${d.name}`] = serializePropertyValue(d, properties[d.name]).join('; '));

    worksheet.addRow(row);
  });

  fitColumnWidths(worksheet);
}

export const exportFolderMetadataExcel = async (store: Store) => {
  Promise.all(store.folders.map(folder => 
    // Fetch metadata annotations for each folder
    store.getFolderMetadata(folder.id).then(metadata => ({
      folder, metadata
    })))).then(result => result.map(({ folder, metadata }) => {
      if (!metadata) return { folder, metadata: undefined };

      const body = Array.isArray(metadata.body) ? metadata.body[0] : metadata.body;
      return { folder, metadata: body }
    })).then(result => {
      const { folderSchemas } = store.getDataModel();

      const workbook = new ExcelJS.Workbook();
    
      workbook.creator = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
      workbook.lastModifiedBy = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
      workbook.created = new Date();
      workbook.modified = new Date();
    
      // Create one worksheet per schema
      folderSchemas.forEach(schema => createSchemaWorksheet(workbook, schema, result, store));
    
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.ms-excel'
        });
    
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = 'folder_metadata.xlsx';
        anchor.click();
      });
    });
}