import type { Bounds }  from '@annotorious/annotorious';
import { Canvas, ImageService2, ImageService3 } from '@iiif/presentation-3';
import { isImageService } from './imageHelpers';

interface ThumbnailOptions {

  size?: number;

}

const generateImageServiceUrl = (
  service: ImageService2 | ImageService3,
  width: number,
  height: number
): string => {
  const id = 'id' in service ? service.id : service['@id'];
  const type = 'type' in service ? service.type : service['@type'];
  const compliance = service.profile || '';

  const isLevel0 = typeof compliance === 'string' &&
    (compliance.includes('level0') || compliance.includes('level:0'));
  
  if (isLevel0) {
    // For level 0, we need to find the closest pre-defined size
    if ('sizes' in service && Array.isArray(service.sizes)) {
      const sizes = service.sizes;
      // Find the closest size that's not larger than our max dimensions
      const suitableSize = sizes
        .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
        
      if (suitableSize)
        return `${id}/full/${suitableSize.width},${suitableSize.height}/0/default.jpg`;
    }
    // If no suitable size found, use the full image
    return `${id}/full/full/0/default.jpg`;
  }
  
  // For level 1+ services, we can request a specific size
  if (type === 'ImageService3') {
    return `${id}/full/!${width},${height}/0/default.jpg`;
  } else {
    return `${id}/full/!${width},${height}/0/native.jpg`;
  }
}

const generateRegionServiceUrl = (
  service: ImageService2 | ImageService3,
  bounds: Bounds,
  targetSize: number
): string => {
  const id = 'id' in service ? service.id : service['@id'];
  const type = 'type' in service ? service.type : service['@type'];
  const compliance = service.profile || '';

  const isLevel0 = typeof compliance === 'string' &&
    (compliance.includes('level0') || compliance.includes('level:0'));

  // TODO level 0 need to be clipped locally
  if (isLevel0) return;

  const region_x = bounds.minX;
  const region_y = bounds.minY;
  const region_w = bounds.maxX - bounds.minX;
  const region_h = bounds.maxY - bounds.minY;

  const aspect = region_w / region_h;
  const isPortrait = aspect < 1;
  
  const h = Math.ceil(isPortrait ? targetSize / aspect : targetSize);
  const w = Math.ceil(isPortrait ? targetSize : targetSize / aspect);

  // Construct the region parameter
  const regionParam = `${Math.round(region_x)},${Math.round(region_y)},${Math.round(region_w)},${Math.round(region_h)}`;

  // For level 1+ services, we can request a specific region and size
  if (type === 'ImageService3') {
    return `${id}/${regionParam}/!${w},${h}/0/default.jpg`;
  } else {
    return `${id}/${regionParam}/!${w},${h}/0/native.jpg`;
  }
}

export const getThumbnail = (
  canvas: Canvas,
  options: ThumbnailOptions = { size: 400 }
): string => {
  const { width, height } = canvas;

  if (!width || !canvas.height) return;

  const { size } = options;

  const aspect = width / height;

  const isPortrait = aspect < 1;
  
  const h = Math.ceil(isPortrait ? size / aspect : size);
  const w = Math.ceil(isPortrait ? size : size / aspect);

  if (canvas.thumbnail && canvas.thumbnail.length > 0) {
    const thumbnail = canvas.thumbnail[0];

    if ('id' in thumbnail)
      return thumbnail.id;

    if ('service' in thumbnail && Array.isArray(thumbnail.service)) {
      const service = thumbnail.service[0];
      if (isImageService(service))
        return generateImageServiceUrl(service, w, h);
    }
  }

  const items = canvas.items || [];

  for (const annotationPage of items) {
    const annotations = annotationPage.items || [];
    
    for (const annotation of annotations) {
      if (annotation.body) {
        const body: any = Array.isArray(annotation.body) 
          ? annotation.body[0] 
          : annotation.body;

        if ('service' in body && Array.isArray(body.service)) {
          const service = body.service[0];
          if (isImageService(service))
            return generateImageServiceUrl(service, w, h);
        }

        if ('id' in body && typeof body.id === 'string')
          return body.id;
      }
    }
  }
}

export const getRegion = (
  canvas: Canvas,
  bounds: Bounds,
  options: ThumbnailOptions = { size: 400 }
): string | undefined => {
  const { size = 400 } = options;

  // First check if there's a suitable image service in the thumbnail
  if (canvas.thumbnail && canvas.thumbnail.length > 0) {
    const thumbnail = canvas.thumbnail[0];
    
    if ('service' in thumbnail && Array.isArray(thumbnail.service)) {
      const service = thumbnail.service[0];
      if (isImageService(service)) {
        return generateRegionServiceUrl(service, bounds, size);
      }
    }
  }

  // Then look through the items for an image service
  const items = canvas.items || [];

  for (const annotationPage of items) {
    const annotations = annotationPage.items || [];
    
    for (const annotation of annotations) {
      if (annotation.body) {
        const body: any = Array.isArray(annotation.body) 
          ? annotation.body[0] 
          : annotation.body;

        if ('service' in body && Array.isArray(body.service)) {
          const service = body.service[0];
          if (isImageService(service)) {
            return generateRegionServiceUrl(service, bounds, size);
          }
        }
      }
    }
  }

  return undefined;
}