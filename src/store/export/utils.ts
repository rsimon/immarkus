import { CozyManifest } from 'cozy-iiif';
import { IIIFManifestResource, MetadataSchema } from '@/model';
import { FileImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { fetchManifest } from '@/utils/iiif';

export const resolveManifests = (manifests: IIIFManifestResource[], onProgress?: () => void) => 
  manifests.reduce<Promise<{ id: string, manifest: CozyManifest}[]>>((promise, manifest) => promise.then(manifests =>
    fetchManifest(manifest.uri).then(fetched => {
      onProgress && onProgress();
      return [...manifests, { id: manifest.id, manifest: fetched }]
    })
  ), Promise.resolve([]));

export const fitColumnWidths = (worksheet: any) => {
  worksheet.columns.forEach(column => {
    const lengths = column.values.map(v => v.toString().length);
    const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
    column.width = maxLength;
  });

  worksheet.columns[0].width = 30;
}

// Should never be necessary, unless users hack the file outside IMMARKUS...
export const deduplicateSchemas = (schemas: MetadataSchema[]) =>
  schemas.reduce<MetadataSchema[]>((distinct, schema) => 
    distinct.some(s => s.name === schema.name) ? distinct : [...distinct, schema], []);

export const addImageToCell = (
  workbook: any,
  worksheet: any,
  snippet: ImageSnippet,
  col: number,
  row: number
) => {
  const embeddedImage = workbook.addImage({
    buffer: (snippet as FileImageSnippet).data,
    extension: 'jpg',
  });

  const aspectRatio = snippet.width / snippet.height;
  const boxAspectRatio = 300 / 100;

  let scaledWidth: number;
  let scaledHeight: number;

  if (aspectRatio > boxAspectRatio) {
    scaledWidth = 300;
    scaledHeight = scaledWidth / aspectRatio;
  } else {
    scaledHeight = 100;
    scaledWidth = scaledHeight * aspectRatio;
  }

  worksheet.addImage(embeddedImage, {
    tl: { col, row },
    ext: { width: scaledWidth, height: scaledHeight }
  });

  worksheet.lastRow.height = 100;
}