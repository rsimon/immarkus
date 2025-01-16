import { Bounds, CozyCanvas } from '../../Types';
import { getImageURLFromService, getRegionURLFromService, isImageService } from '../iiif';

export const getThumbnailURL = (canvas: CozyCanvas, minSize = 400) => {
  const { width, height } = canvas;

  if (!width || !height) return;

  const aspect = width / height;
  const isPortrait = aspect < 1;
  
  const h = Math.ceil(isPortrait ? minSize / aspect : minSize);
  const w = Math.ceil(isPortrait ? minSize : minSize / aspect);

  if (canvas.source.thumbnail && canvas.source.thumbnail.length > 0) {
    const thumbnail = canvas.source.thumbnail[0];

    if ('service' in thumbnail && Array.isArray(thumbnail.service)) {
      const service = thumbnail.service.find(s => isImageService(s));
      if (service)
        return getImageURLFromService(service, w, h);
    }

    if ('id' in thumbnail) return thumbnail.id;
  }

  for (const image of (canvas.images || [])) {
    if (image.type === 'dynamic' || image.type === 'level0') {
      return getImageURLFromService(image.service, w, h);
    } else if (image.type === 'static') {
      // TODO
      console.error('Static image canvas: unspported');
    }    
  }
}

export const getRegionURL = (
  canvas: CozyCanvas,
  bounds: Bounds,
  minSize = 400
): string | undefined => {
  for (const image of (canvas.images || [])) {
    if (image.type === 'dynamic') {
      return getRegionURLFromService(image.service, bounds, minSize);
    } else {
      // TODO
      console.error('Level 0 or static image canvas: unspported');
    }
  }
}