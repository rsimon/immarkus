import { ImageAnnotation } from '@annotorious/react';
import { PageTransform, Region } from '@/services/Types';

export const parseResponse = (data: any, _: PageTransform, region: Region): ImageAnnotation[] => {
  if (!region)
    throw new Error('OpenAI crosswalk: missing region');

  const result = JSON.parse(data.output_text);

  const { text } = result;
  
  return [];
}