import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { getManifestMetadata, Store } from '@/store';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';
import { downloadCSV } from '@/utils/download';
import { Folder, IIIFResource, MetadataSchema } from '@/model';
import { serializePropertyValue } from '@/utils/serialize';
import { fitColumnWidths } from './utils';

const getMetadata = (store: Store, source: Folder | IIIFResource): Promise<{
  source: IIIFResource | Folder;
  metadata: W3CAnnotation;
}> => {
  if ('uri' in source) {
    return getManifestMetadata(store, source.id)
      .then(({ annotation: metadata }) => ({ source, metadata }))
  } else {
    return store.getFolderMetadata(source.id)
      .then(metadata => ({ source, metadata }))
  }
}

export const exportFolderMetadataCSV = async (store: Store) => {
  const { folderSchemas } = store.getDataModel();

  const columns = aggregateSchemaFields(folderSchemas);

  const { folders, iiifResources } = store;

  Promise.all(
    [...folders, ...iiifResources].map(source => getMetadata(store, source))
  ).then(results => results.map(({ source, metadata }) => {
    const entries = zipMetadata(columns, metadata?.body as W3CAnnotationBody);
    return Object.fromEntries([
      ['folder', source.name], 
      ['folder_type', 'uri' in source ? 'iiif_manifest' : 'local'],
      ...entries]);
  }))
  .then(rows => downloadCSV(rows, 'folder_metadata.csv'));
}

const createSchemaWorksheet = (
  workbook: any, 
  schema: MetadataSchema,
  result: { source: Folder | IIIFResource, metadata: W3CAnnotationBody }[],
  store: Store
) => {
  const worksheet = workbook.addWorksheet(schema.name);

  const schemaProps = schema.properties || [];

  worksheet.columns = [
    { header: 'Folder Name', key: 'folder', width: 60 },
    { header: 'Type', key: 'type', width: 60 }, 
    { header: 'Parent Folder', key: 'parent', width: 60 },
    { header: 'File Path', key: 'path', width: 60 },
    ...schemaProps.map(property => ({
      header: property.name, key: `@property_${property.name}`, width: 60
    }))
  ];

  const withThisSchema = result.filter(({ metadata }) => metadata?.source === schema.name);

  withThisSchema.forEach(({ source, metadata }) => {
    const row = {
      folder: source.name,
      parent: 'parent'  in source ? store.getFolder(source.parent)?.name : '',
      type: 'uri' in source ? 'IIIF Manifest' : 'Local Folder',
      path: [...source.path.map(id => store.getFolder(id).name), source.name].join('/')
    };

    const properties = 'properties' in metadata ? metadata.properties : {};

    schemaProps.forEach(d => 
      row[`@property_${d.name}`] = serializePropertyValue(d, properties[d.name]).join('; '));

    worksheet.addRow(row);
  });

  fitColumnWidths(worksheet);
}

export const exportFolderMetadataExcel = async (store: Store) => {
  const { folders, iiifResources}  = store;

  Promise.all(
    [...folders, ...iiifResources].map(source => getMetadata(store, source))
  ).then(result => result.map(({ source, metadata }) => {
      if (!metadata) return { source, metadata: undefined };

      const body = Array.isArray(metadata.body) ? metadata.body[0] : metadata.body;
      return { source, metadata: body }
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