import { ImageAnnotation } from '@annotorious/react';
import { Generator } from '@/services';

export interface AnnotationBatch {

  annotations: ImageAnnotation[];

  generator: Generator;
  
}

export type ProcessingState = 'cropping'
  | 'compressing' 
  | 'fetching_iiif' 
  | 'pending' 
  | 'success' 
  | 'success_empty'
  | 'compressing_failed' 
  | 'service_failed';
