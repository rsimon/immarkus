import { Canvas, IIIFExternalWebResource } from '@iiif/presentation-3';
import { Traverse } from '@iiif/parser';
import { CozyImageResource, ImageServiceResource, StaticImageResource } from '../Types';
import { getPropertyValue } from './resourceUtils';
import { isImageService, parseImageService } from './imageServiceUtils';

const toCozyImageResource = (resource: IIIFExternalWebResource) => {
  const { format, height, id, width } = resource;

  const imageService = (resource.service || []).find(isImageService);

  const service = imageService ? parseImageService(imageService) : undefined; 
  if (service) {
    return {
      type: service.profileLevel === 0 ? 'level0' : 'dynamic',
      service: imageService,
      width,
      height,
      majorVersion: service.majorVersion,
      serviceUrl: getPropertyValue<string>(imageService, 'id')
    } as ImageServiceResource;
  } else {
    return {
      type: 'static',
      width,
      height,
      url: id,
      format
    } as StaticImageResource;
  }
} 

export const getImages = (canvas: Canvas): CozyImageResource[] => {
  const images: CozyImageResource[] = [];

  const builder = new Traverse({
    annotation: [anno => {
      if (anno.motivation === 'painting') {
        const bodies = anno.body ? 
          Array.isArray(anno.body) ? anno.body : [anno.body] 
          : [];

        const imageResources = bodies.filter(b => (b as IIIFExternalWebResource).type === 'Image');
        images.push(...imageResources.map(toCozyImageResource));
      }
    }]
  });

  builder.traverseCanvas(canvas);

  return images;
}