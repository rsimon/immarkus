export interface ImageInfo {

  id: string;
  
  width: number;
  
  height: number;
  
  tiles: TileInfo[];

}

export type Size = { width: number; height: number; };

export interface TileInfo {

  width: number;

  height?: number;

  scaleFactors: number[];

}

export interface Tile {

  x: number;

  y: number;

  width: number;

  height: number;

  url: string;

}