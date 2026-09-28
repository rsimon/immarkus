import { ImageAnnotation } from '@annotorious/react';
import { Generator } from '@/services';

export interface AnnotationBatch {

  annotations: ImageAnnotation[];

  generator: Generator;
  
}
