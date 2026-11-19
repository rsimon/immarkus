import { Region } from '@/services';

export type ProcessingState = 'cropping'
  | 'compressing' 
  | 'fetching_iiif' 
  | 'pending' 
  | 'success' 
  | 'success_empty'
  | 'compressing_failed' 
  | 'service_failed';

export interface AnnotationServiceInput {

  region?: Region;

  rotation: number;

  isFlipped: boolean;

}

export interface AnnotationServiceStatus {

  state?: ProcessingState;
  
  error?: string;

}