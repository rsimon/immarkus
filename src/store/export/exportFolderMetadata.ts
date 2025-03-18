import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { getManifestMetadata, Store } from '@/store';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';
import { downloadCSV } from '@/utils/download';
import { Folder, IIIFManifestResource, IIIFResource, MetadataSchema } from '@/model';
import { serializePropertyValue } from '@/utils/serialize';
import { fitColumnWidths } from './utils';
import { fetchManifest } from '@/utils/iiif';
import { CozyManifest } from 'cozy-iiif';

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

const resolveManifests = (manifests: IIIFManifestResource[]) => 
  manifests.reduce<Promise<CozyManifest[]>>((promise, manifest) => promise.then(manifests =>
    fetchManifest(manifest.uri).then(fetched => ([...manifests, fetched]))
  ), Promise.resolve([]));

const aggregateIIIFMetadataLabels = (manifests: IIIFManifestResource[]) =>
  manifests.reduce<Promise<Set<string>>>((promise, manifest) => promise.then(distinctLabels =>
    fetchManifest(manifest.uri).then(fetched => {
      const labels = fetched.getMetadata().map(m => m.label);
      return new Set([...distinctLabels, ...labels]);
    })
  ), Promise.resolve(new Set([])));

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

  const withThisSchema = result.filter(({ metadata }) => metadata?.source === schema.name);

  // Filter for IIIF manifests and resolve them
  return resolveManifests(withThisSchema.map(t => t.source).filter(s => 'canvases' in s)).then(manifests => {
    const iiifMetadataLabels = [...manifests.reduce<Set<string>>((distinctLabels, manifest) => (
      new Set([...distinctLabels, ...manifest.getMetadata().map(m => m.label)])
    ), new Set([]))];

    worksheet.columns = [
      { header: 'Folder Name', key: 'folder', width: 60 },
      { header: 'Type', key: 'type', width: 60 }, 
      { header: 'Parent Folder', key: 'parent', width: 60 },
      { header: 'File Path', key: 'path', width: 60 },
      ...schemaProps.map(property => ({
        header: property.name, key: `@property_${property.name}`, width: 60
      })),
      ...iiifMetadataLabels.map(label => ({
        header: label, key: `@iiif_property_${label}`, width: 60
      }))
    ];

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

      if ('canvases' in source) {
        const manifest = manifests.find(m => m.id === (source as IIIFManifestResource).uri);
        if (manifest) {
          const meta = manifest.getMetadata();

          iiifMetadataLabels.forEach(p => 
            row[`@iiif_property_${p}`] = meta.find(m => m.label === p)?.value || '');
        }
      }
  
      worksheet.addRow(row);
    });
  
    fitColumnWidths(worksheet);
  });
  
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
    
      return folderSchemas.reduce<Promise<void>>((promise, schema) => promise.then(() => {
        return createSchemaWorksheet(workbook, schema, result, store);
      }), Promise.resolve()).then(() => {
        return workbook.xlsx.writeBuffer().then(buffer => {
          const blob = new Blob([buffer], {
            type: 'application/vnd.ms-excel'
          });
      
          const anchor = document.createElement('a');
          anchor.href = URL.createObjectURL(blob);
          anchor.download = 'folder_metadata.xlsx';
          anchor.click();
        });  
      })
    });
}