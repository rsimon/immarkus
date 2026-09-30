import { ProcessingState, Region, Rotation } from '@/services';

export interface AnnotationServiceInput {

  region?: Region;

  rotation: Rotation;

  isFlipped: boolean;

}

export interface AnnotationServiceStatus {

  state?: ProcessingState;
  
  error?: string;

}