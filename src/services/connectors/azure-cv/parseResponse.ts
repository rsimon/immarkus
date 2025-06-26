import { ImageAnnotation } from '@annotorious/react';
import { PageTransform, Region } from '@/services/Types';

export const parseResponse = (
  data: any, 
  transform: PageTransform,
  _: Region | undefined,
  options: Record<string, any> = { 'merge-annotations': 'dont_merge'}
): ImageAnnotation[] => {
  return [];
}