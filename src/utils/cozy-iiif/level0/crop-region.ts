import { ImageInfo, Bounds, Tile, Level0ImageServiceResource } from '../Types';
import { loadImage } from './common';

const getTileUrl = (
  info: ImageInfo,
  x: number,
  y: number,
  width: number,
  height: number
): string => {
  const tileWidth = info.tiles[0].width;
  const tileHeight = info.tiles[0].height|| info.tiles[0].width;
  return `${info['@id']}/${x * tileWidth},${y * tileHeight},${width},${height}/${tileWidth},/0/default.jpg`;
}

const getTilesForRegion = (info: ImageInfo, bounds: Bounds): Tile[] => {
  const tileWidth = info.tiles[0].width;
  const tileHeight = info.tiles[0].height || info.tiles[0].width; // fallback for square tiles
  const maxWidth = info.width;
  const maxHeight = info.height;

  const startTileX = Math.floor(bounds.x / tileWidth);
  const startTileY = Math.floor(bounds.y / tileHeight);
  const endTileX = Math.ceil((bounds.x + bounds.w) / tileWidth);
  const endTileY = Math.ceil((bounds.y + bounds.h) / tileHeight);

  const tiles: Tile[] = [];
  
  for (let y = startTileY; y < endTileY; y++) {
    for (let x = startTileX; x < endTileX; x++) {
      // Skip tiles outside image bounds
      if (x * tileWidth >= maxWidth || y * tileHeight >= maxHeight) {
        continue;
      }

      // Calculate actual tile dimensions (might be smaller at edges)
      const effectiveWidth = Math.min(tileWidth, maxWidth - (x * tileWidth));
      const effectiveHeight = Math.min(tileHeight, maxHeight - (y * tileHeight));

      tiles.push({
        x,
        y,
        width: effectiveWidth,
        height: effectiveHeight,
        url: getTileUrl(info, x, y, effectiveWidth, effectiveHeight)
      });
    }
  }

  return tiles;
}

export const cropRegion = async (resource: Level0ImageServiceResource, bounds: Bounds): Promise<Blob> => {

  const info = await fetch(resource.serviceUrl).then(res => res.json());

  const tiles = getTilesForRegion(info, bounds);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx)
    // Should never happen
    throw new Error('Error initializing canvas context');
  
  const tileWidth = info.tiles[0].width;
  const tileHeight = info.tiles[0].height || info.tiles[0].width;

  const tilesWidth = (Math.ceil(bounds.w / tileWidth) + 1) * tileWidth;
  const tilesHeight = (Math.ceil(bounds.h / tileHeight) + 1) * tileHeight;

  canvas.width = tilesWidth;
  canvas.height = tilesHeight;

  // TODO implement polite harvesting!
  await Promise.all(tiles.map(async (tile) => {
    const img = await loadImage(tile.url);
    const x = (tile.x * tileWidth) - bounds.x;
    const y = (tile.y * tileHeight) - bounds.y;
    ctx.drawImage(img, x, y);
  }));

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = bounds.w;
  cropCanvas.height = bounds.h;

  const cropCtx = cropCanvas.getContext('2d');
  
  if (!cropCtx)
    throw new Error('Error initializing canvas context');

  // Copy cropped region
  cropCtx.drawImage(canvas, 
    0, 0, bounds.w, bounds.h,
    0, 0, bounds.w, bounds.h
  );

  return new Promise((resolve, reject) => {
    cropCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.95
    );
  });

}