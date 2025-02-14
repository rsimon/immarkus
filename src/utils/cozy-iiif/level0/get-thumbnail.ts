import { ImageInfo, Level0ImageServiceResource } from '../Types';
import { getThrottledLoader } from './throttled-loader';

const getBestScaleFactor = (
  info: ImageInfo,
  minSize?: { width?: number; height?: number }
): number => {
  // Sort descending
  const scaleFactors = info.tiles[0].scaleFactors.sort((a, b) => b - a); 
  
  if (!minSize) 
    // Just return highest scale factor
    return scaleFactors[0];

  const scaleX = minSize.width ? info.width / minSize.width : Infinity;
  const scaleY = minSize.height ? info.height / minSize.height : Infinity;

  const scale = Math.min(scaleX, scaleY);

  // Find the smallest scale factor that still meets our minimum size requirements
  for (const factor of scaleFactors) {
    if (factor <= scale)
      return factor;
  }

  // If no scale factor is small enough, return the smallest available
  return scaleFactors[scaleFactors.length - 1];
};

const getThumbnailDimensions = (
  info: ImageInfo,
  minSize?: { width?: number; height?: number }
): { width: number; height: number } => {
  const scaleFactor = getBestScaleFactor(info, minSize);

  let width = Math.ceil(info.width / scaleFactor);
  let height = Math.ceil(info.height / scaleFactor);

  if (minSize) {
    const aspectRatio = info.width / info.height;
    
    if (minSize.width && width < minSize.width) {
      width = minSize.width;
      height = Math.ceil(width / aspectRatio);
    }
    
    if (minSize.height && height < minSize.height) {
      height = minSize.height;
      width = Math.ceil(height * aspectRatio);
    }
  }

  return { width, height };
}

const getThumbnailTiles = (
  info: ImageInfo,
  minSize?: { width?: number; height?: number }
): { url: string; x: number; y: number }[] => {
  const scaleFactor = getBestScaleFactor(info, minSize);

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

export const getThumbnail = async (
  resource: Level0ImageServiceResource,
  minSize?: { width?: number; height?: number }
): Promise<Blob> => {
  const info = await fetch(resource.serviceUrl).then(res => res.json());

  const tiles = getThumbnailTiles(info, minSize);
  const dimensions = getThumbnailDimensions(info, minSize);
  
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) 
      throw new Error('Error creating canvas context');

  const loader = getThrottledLoader();

  await Promise.all(tiles.map(async (tile) => {
    const img = await loader.loadImage(tile.url);
    ctx.drawImage(img, tile.x, tile.y);
  }));

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, 'image/jpeg', 0.85);
  });
  
}