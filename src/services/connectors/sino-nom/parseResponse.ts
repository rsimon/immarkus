import { ImageAnnotation } from '@annotorious/react';
import { PageTransform, Region } from '@/services/Types';

export const parseResponse = (data: any, _: PageTransform, region: Region): ImageAnnotation[] => {
  console.log(data);
  return [];
}