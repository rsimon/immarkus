import { v4 as uuidv4 } from 'uuid';
import { ShapeType } from '@annotorious/react';
import { AnnotationServiceCrosswalkResponse, PageTransform, Region } from '@/services/Types';
import { parseTranscriptionResponseBodies } from '@/services/utils';

export const parseResponse = (data: any, _: PageTransform, region: Region): AnnotationServiceCrosswalkResponse => {
  if (!region)
    throw new Error('OpenAI crosswalk: missing region');

  const result = JSON.parse(data.output_text);
    
  const id = uuidv4();

  const annotations = [{
    id,
    bodies: parseTranscriptionResponseBodies(id, result),
    target: {
      annotation: id,
      selector: {
        type: ShapeType.RECTANGLE,
        geometry: {
          bounds: {
            minX: region.x,
            minY: region.y,
            maxX: region.x + region.w,
            maxY: region.y + region.h
          },
          ...region
        }
      }
    }
  }];

  return { annotations };
}