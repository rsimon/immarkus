import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { getImageMetadata, Store } from '@/store';
import { downloadCSV } from '@/utils/download';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';
import { CanvasInformation, FileImage, IIIFManifestResource, IIIFResource, Image, MetadataSchema } from '@/model';
import {  W3CAnnotationBody } from '@annotorious/react';
import { serializePropertyValue } from '@/utils/serialize';
import { fitColumnWidths } from './utils';

interface SourceMetadata {

  source: FileImage | CanvasInformation;

  metadata: W3CAnnotationBody;

}

const getMetadata = (store: Store, source: FileImage | IIIFResource): Promise<SourceMetadata[]> => {  
  if ('uri' in source) {
    const canvases = (source as IIIFManifestResource).canvases;
    return canvases.reduce<Promise<SourceMetadata[]>>((p, canvas) => p.then(all => {
      const id = `iiif:${canvas.manifestId}:${canvas.id}`;

      return getImageMetadata(store, id).then(({ metadata }) => (
        [...all, { source: canvas, metadata }]
      ))
    }), Promise.resolve([]));
  } else {
    return store.getImageMetadata(source.id)
      .then(metadata => ([{ source, metadata }]))
  }
}

export const exportImageMetadataCSV = async (store: Store) => {
  const { images, iiifResources } = store;
  const { imageSchemas } = store.getDataModel();

  const columns = aggregateSchemaFields(imageSchemas);

  Promise.all(
    [...images, ...iiifResources].map(source => getMetadata(store, source))
  ).then(results => {
    return results
    .reduce<SourceMetadata[]>((all, batch) => ([...all, ...batch]), [])
      .map(({ source, metadata }) => {
        const entries = zipMetadata(columns, metadata);
        return Object.fromEntries([
          ['image', source.name], 
          ['image_type', 'uri' in source ? 'iiif_canvas' : 'local'],
          ...entries
        ]);
      })
    })
    .then(rows => downloadCSV(rows, 'image_metadata.csv'));
}

const createSchemaWorksheet = (
  workbook: any, 
  schema: MetadataSchema,
  result: { image: Image, metadata: W3CAnnotationBody }[],
  store: Store
) => {
  const worksheet = workbook.addWorksheet(schema.name);

  const schemaProps = schema.properties || [];

  worksheet.columns = [
    { header: 'Filename', key: 'filename', width: 60 },
    { header: 'File Path', key: 'path', width: 60 },
    ...schemaProps.map(property => ({
      header: property.name, key: `@property_${property.name}`, width: 60
    }))
  ];

  const withThisSchema = result.filter(({ metadata }) => metadata?.source === schema.name);

  withThisSchema.forEach(({ image, metadata }) => {
    const row = {
      filename: image.name,
      path: [...image.path.map(id => store.getFolder(id).name), image.name].join('/')
    };

    const properties = 'properties' in metadata ? metadata.properties : {};

    schemaProps.forEach(d => 
      row[`@property_${d.name}`] = serializePropertyValue(d, properties[d.name]).join('; '));

    worksheet.addRow(row);
  });

  fitColumnWidths(worksheet);
}

export const exportImageMetadataExcel = async (store: Store) => {
  Promise.all(store.images.map(image => 
    // Fetch metadata annotations for each folder
    store.getImageMetadata(image.id).then(metadata => ({
      image, metadata
    })))).then(result => {
      const { imageSchemas } = store.getDataModel();

      const workbook = new ExcelJS.Workbook();
    
      workbook.creator = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
      workbook.lastModifiedBy = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
      workbook.created = new Date();
      workbook.modified = new Date();
    
      // Create one worksheet per schema
      imageSchemas.forEach(schema => createSchemaWorksheet(workbook, schema, result, store));
    
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.ms-excel'
        });
    
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = 'image_metadata.xlsx';
        anchor.click();
      });
    });
}