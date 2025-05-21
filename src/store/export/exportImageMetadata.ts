import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { CozyManifest, CozyMetadata } from 'cozy-iiif';
import { getImageMetadata, Store } from '@/store';
import { downloadCSV } from '@/utils/download';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';
import { CanvasInformation, FileImage, IIIFManifestResource, IIIFResource, MetadataSchema } from '@/model';
import { W3CAnnotationBody } from '@annotorious/react';
import { serializePropertyValue } from '@/utils/serialize';
import { deduplicateSchemas, fitColumnWidths, resolveManifests } from './utils';

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

const aggregateIIIFMetadataLabels = (manifests: CozyManifest[]) => {
  return [
    ...manifests.reduce<Set<string>>((distinct, manifest) => {
      const manifestLabels = manifest.getMetadata().map(m => m.label);

      const canvasLabels = manifest.canvases.reduce<Set<string>>((distinct, canvas) => (
        new Set([...distinct, ...canvas.getMetadata().map(m => m.label)])
      ), new Set([]));

      return new Set([...distinct, ...manifestLabels, ...canvasLabels]);
    }, new Set([]))
  ];  
}

const getCanvasMetadata = (info: CanvasInformation, field: string, manifests: { id: string, manifest: CozyManifest }[]) => {
  const { manifest: cozyManifest } = manifests.find(c => c.id === info.manifestId);
  const cozyCanvas = cozyManifest.canvases.find(c => c.id === info.uri);
  
  const metadata = [
    ...(cozyManifest?.getMetadata() || []),
    ...(cozyCanvas?.getMetadata() || []) 
  ];

  return metadata.find(m => m.label.toLowerCase() === field.toLowerCase())?.value;
}

const getCanvasToCPath = (info: CanvasInformation, manifests: { id: string, manifest: CozyManifest }[]) => {
  const { manifest: cozyManifest } = manifests.find(c => c.id === info.manifestId);
  const cozyCanvas = cozyManifest.canvases.find(c => c.id === info.uri);

  const toc = cozyManifest.getTableOfContents();

  // Keep only ranges, not the canvas itself
  const breadcrumbs = toc.getBreadcrumbs(cozyCanvas.id).filter(n => n.type === 'range');
  return breadcrumbs.map(node => node.getLabel());
}

export const exportImageMetadataCSV = async (
  store: Store,
  onProgress: ((progress: number) => void)
) => {
  const { images, iiifResources } = store;
  const { imageSchemas: _imageSchemas } = store.getDataModel();
  const imageSchemas = deduplicateSchemas(_imageSchemas);

  // One step for comfort ;-) Then one for each iiifResource, plus final step for creating the XLSX
  const progressIncrement = 100 / (iiifResources.length + 1);

  let progress = 0;

  const updateProgress = () => {
    progress += progressIncrement;
    onProgress(progress);
  }

  updateProgress();

  const customColumns = aggregateSchemaFields(imageSchemas);  

  return resolveManifests(iiifResources as IIIFManifestResource[], updateProgress).then(manifests => {
    const iiifColumns = aggregateIIIFMetadataLabels(manifests.map(r => r.manifest));

    return Promise.all(
      [...images, ...iiifResources].map(source => getMetadata(store, source))
    ).then(results => {
      onProgress(100);

      return results
        .reduce<SourceMetadata[]>((all, batch) => ([...all, ...batch]), [])
        .map(({ source, metadata }) => {
          const entries = zipMetadata(customColumns, metadata);

          return Object.fromEntries([
            ['image', source.name], 
            ['image_type', 'uri' in source ? 'iiif_canvas' : 'local'],
            ...entries,
            ...iiifColumns.map(label => [
              label,
              'uri' in source ? getCanvasMetadata(source, label, manifests) : ''
            ])
          ]);
        })
      })
      .then(rows => downloadCSV(rows, 'image_metadata.csv'));  
  });
}

const createSchemaWorksheet = (
  workbook: any, 
  schema: MetadataSchema | undefined,
  result: { source: FileImage | CanvasInformation, metadata: W3CAnnotationBody }[],
  store: Store
) => {
  const worksheet = workbook.addWorksheet(schema?.name || 'No Schema');

  const schemaProps = schema?.properties || [];

  const withThisSchema = result.filter(({ metadata }) => metadata?.source === schema?.name);

  const manifestIds = [...new Set(withThisSchema.reduce<string[]>((manifestIds, { source }) => (
    'manifestId' in source ? [...manifestIds, source.manifestId] : manifestIds
  ), []))];

  return resolveManifests(
    manifestIds.map(id => store.getIIIFResource(id) as IIIFManifestResource)
  ).then(resolved => {
    const iiifMetadataLabels = aggregateIIIFMetadataLabels(resolved.map(r => r.manifest));

    worksheet.columns = [
      { header: 'Filename', key: 'filename', width: 60 },
      { header: 'Type', key: 'type', width: 60 }, 
      { header: 'Path', key: 'path', width: 60 },
      ...schemaProps.map(property => ({
        header: property.name, key: `@property_${property.name}`, width: 60
      })),
      ...iiifMetadataLabels.map(label => ({
        header: label, key: `@iiif_property_${label}`, width: 60
      }))
    ];
  
    const getPath = (source: FileImage | CanvasInformation) => {
      if ('path' in source) { 
        return source.path.map(id => store.getFolder(id)?.name).filter(Boolean);
      } else {
        const manifest = store.getIIIFResource(source.manifestId);
        return [
          ...manifest?.path.map(id => store.getFolder(id)?.name).filter(Boolean) || [],
          manifest?.name,
          ...getCanvasToCPath(source, resolved)
        ].filter(Boolean);
      }
    }
  
    withThisSchema.forEach(({ source, metadata }) => {
      const row = {
        filename: source.name,
        type: 'uri' in source ? 'IIIF Canvas' : 'Local File',
        path: getPath(source).join('/')
      };

      const properties = (metadata && 'properties' in metadata) ? metadata.properties : {};
    
      schemaProps.forEach(d => 
        row[`@property_${d.name}`] = serializePropertyValue(d, properties[d.name]).join('; '));

      if ('manifestId' in source) {
        iiifMetadataLabels.forEach(label => 
          row[`@iiif_property_${label}`] = getCanvasMetadata(source, label, resolved));
      }

      // Only include this row if there is actual metadata,
      if (Object.keys(row).length > 3)
        worksheet.addRow(row);
    });
  
    fitColumnWidths(worksheet);
  })
}

export const exportImageMetadataExcel = async (store: Store, onProgress: (progress: number) => void) => {
  const { images, iiifResources } = store;
  const { imageSchemas: _imageSchemas } = store.getDataModel();
  const imageSchemas = deduplicateSchemas(_imageSchemas);

  // One for each schema + schema-less images, on for final export
  const progressIncrement = 100 / (imageSchemas.length + 2);

  let progress = 0;

  const updateProgress = () => {
    progress += progressIncrement;
    onProgress(progress);
  }

  onProgress(1);

  Promise.all(
    [...images, ...iiifResources].map(source => getMetadata(store, source))
  ).then(result => 
    // Flatten
    result.reduce<SourceMetadata[]>((all, batch) => ([...all, ...batch]), [])
  ).then(result => {
      const workbook = new ExcelJS.Workbook();
    
      workbook.creator = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
      workbook.lastModifiedBy = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
      workbook.created = new Date();
      workbook.modified = new Date();
    
      // Create a worksheet for each schema, plus one for schema-less images
      return [...imageSchemas, undefined].reduce<Promise<void>>((promise, schema) => promise.then(() => {
        updateProgress();
        return createSchemaWorksheet(workbook, schema, result, store);
      }), Promise.resolve()).then(() => {
        return workbook.xlsx.writeBuffer().then(buffer => {
          onProgress(100);

          const blob = new Blob([buffer], {
            type: 'application/vnd.ms-excel'
          });
      
          const anchor = document.createElement('a');
          anchor.href = URL.createObjectURL(blob);
          anchor.download = 'image_metadata.xlsx';
          anchor.click();
        });
      })
    });
}