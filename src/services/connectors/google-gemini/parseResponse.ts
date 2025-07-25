import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { PageTransform, Region } from '@/services/Types';

export const parseResponse = (data: any, _: PageTransform, region: Region): ImageAnnotation[] => {
  if (!region)
    throw new Error('OpenAI crosswalk: missing region');

  const candidates: any[] = data.candidates;

  const text = candidates.reduce<string[]>((text, candidate) => {
    return [...text, ...candidate.content.parts.map((part: any) => {
      const obj = JSON.parse(part.text);
      return obj.transcription;
    })];
  }, []).join();

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
}