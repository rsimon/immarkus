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

  /**
   * There's an ugly catch with the vertices contained in Google Vision responses: x and/or y 
   * might be missing! See this–deeply buried in the docs (and actually from the face 
   * recognition docs):
   * 
   * "Note that one or more x and/or y coordinates may not be generated in the BoundingPoly 
   * (the polygon will be unbounded) if only a partial face appears in the image to be annotated."
   * 
   * Cf. https://stackoverflow.com/questions/39378862/incomplete-coordinate-values-for-google-vision-ocr
   * 
   * In our case, we set the coordinate to 0 if missing, since this seems the most reasonable thing to do.
   */
  const points: [number, number][] = 
    vertices.map(({ x, y }) => transform({ x: x || 0, y: y || 0})).map(({ x, y }) => ([x, y]));

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