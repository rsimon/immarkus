import { v4 as uuidv4 } from 'uuid';
import { boundsFromPoints, ShapeType } from '@annotorious/react';
import type { AnnotationBody, ImageAnnotation } from '@annotorious/react';
import { PageTransform, Region } from '@/services/Types';

export const parseResponse = (data: any, transform: PageTransform, _: Region): ImageAnnotation[] => {
  const { result_bbox } = data;

  const annotations = result_bbox.map(([ box, [text, _ ]]) => {
    const id = uuidv4();

    const points: [number, number][] = box.map(([x, y]) => transform({ x, y })).map(({ x, y }) => ([x, y]));
    const bounds = boundsFromPoints(points);

    return {
      id,
      bodies: [{
        annotation: id,
        purpose: 'commenting',
        value: text
      } as AnnotationBody],
      target: {
        annotation: id,
        selector: {
          type: ShapeType.POLYGON,
          geometry: { bounds, points }
        }
      }
    }
  }) 

  // console.log(annotations);

  return annotations;
}
