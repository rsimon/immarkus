import { Canvas, IIIFExternalWebResource } from '@iiif/presentation-3';
import { Traverse } from '@iiif/parser';
import { getPropertyValue } from './resource';
import { getImageURLFromService, getRegionURL, isImageService, parseImageService } from './image-service';
import { 
  CozyImageResource, 
  DynamicImageServiceResource, 
  ImageServiceResource, 
  Level0ImageServiceResource, 
  StaticImageResource 
} from '../typez';

export const getThumbnailURL = (canvas: Canvas, images: CozyImageResource[] = []) => (minSize = 400) => {
  const { width, height } = canvas;

  if (!width || !height) return;

  const aspect = width / height;
  const isPortrait = aspect < 1;
  
  const h = Math.ceil(isPortrait ? minSize / aspect : minSize);
  const w = Math.ceil(isPortrait ? minSize : minSize / aspect);

  if (canvas.thumbnail && canvas.thumbnail.length > 0) {
    const thumbnail = canvas.thumbnail[0];

    if ('service' in thumbnail && Array.isArray(thumbnail.service)) {
      const service = thumbnail.service.find(s => isImageService(s));
      if (service)
        return getImageURLFromService(service, w, h);
    }

    if ('id' in thumbnail) return thumbnail.id;
  }

  for (const image of images) {
    if (image.type === 'dynamic' || image.type === 'level0') {
      return getImageURLFromService(image.service, w, h);
    } else if (image.type === 'static') {
      // console.warn('Static image canvas');
      return image.url;
    }    
  }
}

export const normalizeServiceUrl = (url: string) =>
  url.endsWith('/info.json') ? url : `${url.endsWith('/') ? url : `${url}/`}info.json`;

const toCozyImageResource = (resource: IIIFExternalWebResource) => {
  const { format, height, width } = resource;

  const id = getPropertyValue(resource, 'id');

  const imageService = (resource.service || []).find(isImageService);

  const service = imageService ? parseImageService(imageService) : undefined; 
  if (service) {
    const image = {
      source: resource,
      type: service.profileLevel === 0 ? 'level0' : 'dynamic',
      service: imageService,
      width,
      height,
      majorVersion: service.majorVersion,
      serviceUrl: normalizeServiceUrl(getPropertyValue<string>(imageService, 'id'))
    } as ImageServiceResource;

    if (service.profileLevel === 0) {
      return image as Level0ImageServiceResource;
    } else {
      return {
        ...image,
        getRegionURL: getRegionURL(image)
      } as DynamicImageServiceResource;
    }
  } else {
    return {
      source: resource,
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