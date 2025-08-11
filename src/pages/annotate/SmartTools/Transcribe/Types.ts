import { ImageAnnotation } from '@annotorious/react';
import { Generator } from '@/services';

export interface OCROptions {

  connectorId: string;

  serviceOptions?: Record<string, any>;

}

export type ProcessingState = 'cropping'
  | 'compressing' 
  | 'fetching_iiif' 
  | 'pending' 
  | 'success' 
  | 'success_empty'
  | 'compressing_failed' 
  | 'ocr_failed';

export interface AnnotationBatch {

  annotations: ImageAnnotation[];

  generator: Generator;
  
}
