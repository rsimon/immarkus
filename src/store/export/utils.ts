import { CozyManifest } from 'cozy-iiif';
import { W3CAnnotation } from '@annotorious/react';
import { CanvasInformation, Image, MetadataSchema } from '@/model';
import { FileImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { Store } from '../Store';

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

export const getFullPath = (source: Image | CanvasInformation, store: Store, manifests: { id: string, manifest: CozyManifest }[]) => {
  const getCanvasToCPath = (info: CanvasInformation, manifests: { id: string, manifest: CozyManifest }[]) => {
    const { manifest: cozyManifest } = manifests.find(c => c.id === info.manifestId);
    const cozyCanvas = cozyManifest.canvases.find(c => c.id === info.uri);

    const toc = cozyManifest.getTableOfContents();

    // Keep only ranges, not the canvas itself
    const breadcrumbs = toc.getBreadcrumbs(cozyCanvas.id).filter(n => n.type === 'range');
    return breadcrumbs.map(node => node.getLabel());
  }

  if ('path' in source) { 
    return source.path.map(id => store.getFolder(id)?.name).filter(Boolean);
  } else {
    const manifest = store.getIIIFResource(source.manifestId);
    return [
      ...manifest?.path.map(id => store.getFolder(id)?.name).filter(Boolean) || [],
      manifest?.name,
      ...getCanvasToCPath(source, manifests)
    ].filter(Boolean);
  }
}

const crosswalkIIIFTarget = (annotation: W3CAnnotation, imageId: string, store: Store): W3CAnnotation => {
  if (!Array.isArray(annotation.target) && typeof annotation.target !== 'string') {
    const canvas = store.getCanvas(imageId);
    
    // Should never happen
    if (!canvas) return annotation;

    return {
      ...annotation,
      target: {
        ...annotation.target,
        source: canvas.uri
      }
    };
  } else {
    // Type safety protection - should never happen
    return annotation;
  }
}

// Shorthand
type ImageLike = Image | CanvasInformation;

const _bulkGetAnnotations = (images: ImageLike[], store: Store): Promise<W3CAnnotation[]> => {
  return images.reduce<Promise<W3CAnnotation[]>>((promise, image) => {
    return promise.then((all) => {
      const isManifest = 'manifestId' in image;
      const id = isManifest ? `iiif:${image.manifestId}:${image.id}` : image.id;

      return store.getAnnotations(id).then(annotations => {
        return isManifest ? (
          // Replace IMMARKUS internal ID with Canvas URI
          [...all, ...annotations.map(a => crosswalkIIIFTarget(a, id, store))]
        ) : (
          [...all, ...annotations]
        );
      })
    })
  }, Promise.resolve([]));
}

const _getAnnotations = (image: ImageLike, store: Store): Promise<W3CAnnotation[]> => {
  const isManifest = 'manifestId' in image;
  const id = isManifest ? `iiif:${image.manifestId}:${image.id}` : image.id;

  return store.getAnnotations(id).then(annotations => {
    return isManifest 
      // Replace IMMARKUS internal ID with Canvas URI
      ? annotations.map(a => crosswalkIIIFTarget(a, id, store))
      : annotations;
  });
}

export const getAnnotations = (arg: ImageLike | ImageLike[], store: Store): Promise<W3CAnnotation[]> =>
  Array.isArray(arg) ? _bulkGetAnnotations(arg, store) : _getAnnotations(arg, store);