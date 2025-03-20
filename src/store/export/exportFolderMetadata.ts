import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { CozyManifest } from 'cozy-iiif';
import { getManifestMetadata, Store } from '@/store';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';
import { downloadCSV } from '@/utils/download';
import { Folder, IIIFManifestResource, IIIFResource, MetadataSchema } from '@/model';
import { serializePropertyValue } from '@/utils/serialize';
import { fitColumnWidths, resolveManifests } from './utils';

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

export const exportFolderMetadataCSV = async (
  store: Store,
  onProgress: ((progress: number) => void)
) => {
  const { folderSchemas } = store.getDataModel();
  const { folders, iiifResources } = store;

  // One step for comfort ;-) Then one for each iiifResource, plus final step for creating the XLSX
  const progressIncrement = 100 / (iiifResources.length + 1);

  let progress = 0;

  const updateProgress = () => {
    progress += progressIncrement;
    onProgress(progress);
  }

  updateProgress();

  const customColumns = aggregateSchemaFields(folderSchemas);

  return resolveManifests(iiifResources as IIIFManifestResource[], updateProgress).then(manifests => {
    const iiifColumns = aggregateIIIFMetadataLabels(manifests.map(m => m.manifest));

    const getResourceMetadata = (resource: IIIFManifestResource, field: string) => {
      const cozy = manifests.find(c => c.manifest.id === resource.uri);
      return cozy?.manifest.getMetadata().find(m => m.label.toLowerCase() === field.toLowerCase())?.value;
    }

    return Promise.all(
      [...folders, ...iiifResources].map(source => getMetadata(store, source))
    ).then(results => results.map(({ source, metadata }) => {
      const entries = zipMetadata(customColumns, metadata?.body as W3CAnnotationBody);
      return Object.fromEntries([
        ['folder', source.name], 
        ['folder_type', 'uri' in source ? 'iiif_manifest' : 'local'],
        ...entries, 
        ...('canvases' in source 
          ? iiifColumns.map(label => ([label, getResourceMetadata(source, label)]))
          : [])
      ]);
    }))
    .then(rows => downloadCSV(rows, 'folder_metadata.csv'));
  });
}

const aggregateIIIFMetadataLabels = (manifests: CozyManifest[]) =>
  [...manifests.reduce<Set<string>>((distinctLabels, manifest) => (
    new Set([...distinctLabels, ...manifest.getMetadata().map(m => m.label)])
  ), new Set([]))];

const createSchemaWorksheet = (
  workbook: any, 
  schema: MetadataSchema | undefined,
  result: { source: Folder | IIIFResource, metadata: W3CAnnotationBody }[],
  store: Store,
  onProgress: () => void
) => {
  const worksheet = workbook.addWorksheet(schema?.name || 'No Schema');

  const schemaProps = schema?.properties || [];

  const withThisSchema = result.filter(({ metadata }) => metadata?.source === schema?.name);

  // Filter for IIIF manifests and resolve them
  return resolveManifests(
    withThisSchema.map(t => t.source).filter(s => 'canvases' in s),
    onProgress
  ).then(resolved => {
    const manifests = resolved.map(p => p.manifest);

    const iiifMetadataLabels = aggregateIIIFMetadataLabels(manifests);

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
  
      const properties = (metadata && 'properties' in metadata) ? metadata.properties : {};
  
      schemaProps.forEach(d => 
        row[`@property_${d.name}`] = serializePropertyValue(d, properties[d.name]).join('; '));

      if ('canvases' in source) {
        const manifest = manifests.find(m => (source as IIIFManifestResource).uri.startsWith(m.id));
        if (manifest) {
          const meta = manifest.getMetadata();

          iiifMetadataLabels.forEach(p => 
            row[`@iiif_property_${p}`] = meta.find(m => m.label === p)?.value.toString() || '');
        }
      }
  
      worksheet.addRow(row);
    });
  
    fitColumnWidths(worksheet);
  });
  
}

export const exportFolderMetadataExcel = async (store: Store, onProgress: ((progress: number) => void)) => {
  const { folders, iiifResources }  = store;

  // One step for comfort ;-) Then one for each iiifResource, plus final step for creating the XLSX
  const progressIncrement = 100 / (iiifResources.length + 1);

  let progress = 0;

  const updateProgress = () => {
    progress += progressIncrement;
    onProgress(progress);
  }

  updateProgress();

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
    
      return [...folderSchemas, undefined].reduce<Promise<void>>((promise, schema) => promise.then(() => {
        return createSchemaWorksheet(workbook, schema, result, store, updateProgress);
      }), Promise.resolve()).then(() => {
        return workbook.xlsx.writeBuffer().then(buffer => {
          onProgress(100);

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