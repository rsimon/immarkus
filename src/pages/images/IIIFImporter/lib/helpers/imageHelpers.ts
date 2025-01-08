import { Traverse } from '@iiif/parser';
import { IIIFImage } from '../Types';
import { 
  AnnotationBody, 
  Canvas, 
  IIIFExternalWebResource, 
  ImageService2, ImageService3,
  Service 
} from '@iiif/presentation-3';

type ImageService = ImageService2 | ImageService3;

const isImageResource = (body: AnnotationBody): body is IIIFExternalWebResource => 
  (body as IIIFExternalWebResource).type === 'Image';

const isImageService = (s: any): s is ImageService =>
  (('@type' in s) && (s['@type'].startsWith('ImageService')) || (('type' in s ) && s.type.startsWith('ImageService')));

const parseImageService = (service: Service) => {
  if ('@type' in service && service['@type'] === 'ImageService2') {
    // Image API 2.x
    const service2 = service as ImageService2;

    const labels = ['level0', 'level1', 'level2'];
    const profiles = Array.isArray(service2.profile) ? service2.profile : [service2.profile];

    const levels = profiles
      .map(profile => labels.findIndex(level => profile.toString().includes(level)))
      .filter(l => l > -1)
      .sort((a, b) => b - a); // Sort descending

    return { majorVersion: 2, profileLevel: levels[0] };
  } else if ('type' in service) {
    // Image API 3
    const service3 = service as ImageService3;
    return { majorVersion: 3, profileLevel: parseInt(service3.profile)}
  }
}

const toImage = (resource: IIIFExternalWebResource) => {
  const { format, height, id, width } = resource;

  const imageService = (resource.service || []).find(isImageService);

  const service = imageService ? parseImageService(imageService) : undefined; 

  return {
    type: 'IIIF_IMAGE',
    format, 
    height,
    id,
    jsonld: resource,
    service,
    width
  } as IIIFImage;
} 

export const getImages = (canvas: Canvas): IIIFImage[] => {
  const images: IIIFImage[] = [];

  const builder = new Traverse({

    annotation: [anno => {
      if (anno.motivation === 'painting') {
        const bodies = Array.isArray(anno.body) ? anno.body : [anno.body];
        const imageResources = bodies.filter(isImageResource);
        images.push(...imageResources.map(toImage));
      }
    }]
  });

  builder.traverseCanvas(canvas);

  return images;
}