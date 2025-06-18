import { v4 as uuidv4 } from 'uuid';
import { PageTransform } from '@/services/Types';
import { ImageAnnotation, Polygon, ShapeType } from '@annotorious/react';
import type { AnnotationBody } from '@annotorious/react';
import { boundsFromPoints } from '@annotorious/annotorious';

const toAnnotation = (
  text: string, 
  vertices: { x: number, y: number }[],
  transform: PageTransform
): ImageAnnotation => {
  const id = uuidv4();

  const points: [number, number][] = vertices.map(transform).map(({ x, y }) => [x, y]);
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
        geometry: {
          bounds,
          points
        }
      } as Polygon
    }
  }
}

export const parseResponse = (data: any, transform: PageTransform): ImageAnnotation[] => {
  const response = data.responses[0];

  if (!response) {
    console.error(data);
    throw new Error('Could not parse response');
  }

  return response.textAnnotations
    .filter(({ locale }) => !locale)
    .map(({ description, boundingPoly: { vertices }}) =>
      toAnnotation(description, vertices, transform), []);
}