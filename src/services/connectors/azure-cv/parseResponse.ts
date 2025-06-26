import { v4 as uuidv4 } from 'uuid';
import { boundsFromPoints, ShapeType } from '@annotorious/react';
import type { AnnotationBody, ImageAnnotation, Polygon } from '@annotorious/react';
import { PageTransform } from '@/services/Types';
import { AnalyzeResults, Line } from '@azure/cognitiveservices-computervision/esm/models';

const toAnnotation = (line: Line, transform: PageTransform): ImageAnnotation => {
  const { text, boundingBox } = line;

  const [x1, y1, x2, y2, x3, y3, x4, y4 ] = boundingBox;

  const points: [number, number][] = [
    { x: x1, y: y1 },
    { x: x2, y: y2 }, 
    { x: x3, y: y3 },
    { x: x4, y: y4 }
  ].map(pt => transform(pt)).map(({ x, y }) => ([x, y]));

  const bounds = boundsFromPoints(points);

  const id = uuidv4();

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

export const parseResponse = (
  data: AnalyzeResults, 
  transform: PageTransform
): ImageAnnotation[] => 
  data.readResults.reduce<ImageAnnotation[]>((annotations, result) => (
    [...annotations, ...result.lines.map(line => toAnnotation(line, transform))]
  ), []);