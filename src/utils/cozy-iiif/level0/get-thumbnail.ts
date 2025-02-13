import { ImageInfo, Level0ImageServiceResource } from '../Types';
import { loadImage } from './common';

const getHighestScaleFactor = (info: ImageInfo): number => Math.max(...info.tiles[0].scaleFactors);

const getThumbnailDimensions = (info: ImageInfo): { width: number; height: number } => {
  const scaleFactor = getHighestScaleFactor(info);
  return {
    width: Math.ceil(info.width / scaleFactor),
    height: Math.ceil(info.height / scaleFactor)
  };
}

const getThumbnailTiles = (info: ImageInfo): { url: string; x: number; y: number }[] => {
  const scaleFactor = getHighestScaleFactor(info);
  const tileWidth = info.tiles[0].width;
  const tileHeight = info.tiles[0].height || info.tiles[0].width;
  
  const cols = Math.ceil(info.width / (tileWidth * scaleFactor));
  const rows = Math.ceil(info.height / (tileHeight * scaleFactor));
  
  const tiles = [];
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const actualWidth = Math.min(tileWidth, 
        (info.width - x * tileWidth * scaleFactor) / scaleFactor);
      const actualHeight = Math.min(tileHeight, 
        (info.height - y * tileHeight * scaleFactor) / scaleFactor);
        
      if (actualWidth <= 0 || actualHeight <= 0) continue;
      
      tiles.push({
        url: `${info['@id']}/${x * tileWidth * scaleFactor},${y * tileHeight * scaleFactor},${actualWidth * scaleFactor},${actualHeight * scaleFactor}/${Math.ceil(actualWidth)},/0/default.jpg`,
        x: x * tileWidth,
        y: y * tileHeight
      });
    }
  }
  
  return tiles;
}

export const getThumbnail = async (resource: Level0ImageServiceResource): Promise<Blob> => {
  
  const info = await fetch(resource.serviceUrl).then(res => res.json());

  const tiles = getThumbnailTiles(info);

  const dimensions = getThumbnailDimensions(info);
  
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) 
      throw new Error('Error creating canvas context');

  await Promise.all(tiles.map(async (tile) => {
    console.log('fetching', tile.url);
    const img = await loadImage(tile.url);
    ctx.drawImage(img, tile.x, tile.y);
  }));

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, 'image/jpeg', 0.85);
  });
}