import { v4 as uuidv4 } from 'uuid';
import { ShapeType } from '@annotorious/react';
import type { AnnotationBody, ImageAnnotation } from '@annotorious/react';
import { PageTransform, Region } from '@/services/Types';

export const parseResponse = (data: any, _: PageTransform, region: Region): ImageAnnotation[] => {
  const choices = (data.choices || []);
  if (choices.length === 0) {
    console.warn('Repsonse with no choices', data);
    return [];
  }

  const result = choices.find(c => c.message.content)?.message?.content;
  if (!result) {
    console.warn('Response with no result content', data);
    return [];
  }

  try {
    const { text } = JSON.parse(result);
    if (!text)
      throw new Error('Could not parse response');

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
    console.error(data);
    console.error(error);
    throw error;
  }
}