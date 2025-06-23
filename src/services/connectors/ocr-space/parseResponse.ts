import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { PageTransform, Region } from '@/services/Types';

interface ParseOCRSpaceResponseArgs {

  'merge-lines'?: boolean;

}

const toAnnotation = (text: string, region: Region): ImageAnnotation => {
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
  }
}

const createLineAnnotation = (line: any, transform: PageTransform): ImageAnnotation => {
  const { LineText, Words } = line;
  
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;
  
  Words.forEach(({ Left, Top, Height, Width }) => {
    minLeft = Math.min(minLeft, Left);
    minTop = Math.min(minTop, Top);
    maxRight = Math.max(maxRight, Left + Width);
    maxBottom = Math.max(maxBottom, Top + Height);
  });
  
  const region = transform({
    x: minLeft,
    y: minTop,
    w: maxRight - minLeft,
    h: maxBottom - minTop
  });

  return toAnnotation(LineText, region);
}

const createWordAnnotations = (line: any, transform: PageTransform): ImageAnnotation[] =>
  line.Words.map(({ WordText, Left, Top, Height, Width }) => {
    const region = transform({ x: Left, y: Top, w: Width, h: Height });
    return toAnnotation(WordText, region);
  });

export const parseResponse = (
  data: any, 
  transform: PageTransform, 
  _: Region | undefined,
  options: ParseOCRSpaceResponseArgs = { 'merge-lines': false }
): ImageAnnotation[] =>
  (data.ParsedResults as any[]).reduce<ImageAnnotation[]>((all, result) => {
    if ('TextOverlay' in result) {
      const onThisPage = (result.TextOverlay.Lines as any[]).reduce<ImageAnnotation[]>((all, line) => {
        if (options['merge-lines']) {
          return [...all, createLineAnnotation(line, transform)];
        } else {  
          return [...all, ...createWordAnnotations(line, transform)];
        }
      }, []);

      return [...all, ...onThisPage];
    } else {
      return all;
    }
  }, []);