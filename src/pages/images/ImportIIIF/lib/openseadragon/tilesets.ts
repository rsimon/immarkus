import { AnnotationBody, Canvas, Service } from '@iiif/presentation-3';
import { Traverse } from '@iiif/parser';

const normalizeServiceURL = (uri: string) =>
  uri.endsWith('/info.json') ? uri : `${uri.endsWith('/') ? uri : `${uri}/`}info.json`;

const getTilesetURL = (imageBody: AnnotationBody) => {
  const services: Service[] = Array.isArray((imageBody as any).service) 
    ? (imageBody as any).service : [(imageBody as any).service];

  const imageService = services
    .find(s => ('@type' in s) && (typeof s['@type'] === 'string') && (s['@type'].startsWith('ImageService')));
    
  if (imageService)
    return normalizeServiceURL(imageService['@id']);
}

export const getOSDTilesets = (canvas: Canvas) => {

  const tilesets: string[] = [];

  const builder = new Traverse({
    annotation: [annotation => {
      if (annotation.motivation === 'painting') {
        const imageBodies = 
          (Array.isArray(annotation.body) ? annotation.body : [annotation.body])
            .filter(b => (b as any).type === 'Image');

        tilesets.push(...imageBodies.map(getTilesetURL));
      }
    }]
  });

  builder.traverseCanvas(canvas);

  return tilesets;

}