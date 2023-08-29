import { Annotation } from '@annotorious/react';

export interface AnnotatedImage {

  id: string;

  filename: string;

  src: string;

  annotations: Annotation[];
  
}