import { v4 as uuidv4 } from 'uuid';
import { ShapeType } from '@annotorious/react';
import type { AnnotationBody, ImageAnnotation } from '@annotorious/react';
import type { PageTransform, Region } from '@/services/Types';

export const parseResponse = (str: string, _: PageTransform, region: Region): ImageAnnotation[]  => {
  try {
    // Strip markdown container, if any
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, str];
    const { text } = JSON.parse(match[1]);

    const id = uuidv4();

    return [{
      id,
      bodies: [{
        annotation: id,
        purpose: 'commenting',
        value: text
      } as AnnotationBody],
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
  } catch (error) {
    console.error(str);
    console.error(error);
    throw error;
  }
}