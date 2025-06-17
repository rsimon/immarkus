export interface Region {

  x: number;

  y: number;

  w: number;

  h: number;
  
}

export type PageTransform =  (region: Region) => Region;

export type ProcessingState = 'cropping'
  | 'compressing' 
  | 'fetching_iiif' 
  | 'pending' 
  | 'success' 
  | 'success_empty'
  | 'compressing_failed' 
  | 'ocr_failed';
