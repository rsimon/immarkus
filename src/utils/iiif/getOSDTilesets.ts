import { CozyCanvas } from 'cozy-iiif';

export const getOSDTilesets = (canvas: CozyCanvas) => canvas.images.map(image => {
  if (image.type === 'dynamic' || image.type === 'level0') {
    return image.serviceUrl;
  } else if (image.type === 'static') {
    return {
      type: 'image',
      url: image.url
    } as Object
  }
});
