import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { PageTransform, Region } from '@/services/Types';

interface MistralOCRBlock {

  topLeftX: number;
  
  topLeftY: number;
  
  bottomRightX: number;
  
  bottomRightY: number;
  
  content: string;
  
  type: string;

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

const createBlockAnnotation = (block: MistralOCRBlock, transform: PageTransform): ImageAnnotation => {
  const { topLeftX, topLeftY, bottomRightX, bottomRightY, content } = block;

  const region = transform({
    x: topLeftX,
    y: topLeftY,
    w: bottomRightX - topLeftX,
    h: bottomRightY - topLeftY
  });

  return toAnnotation(content, region);
}

export const parseResponse = (
  data: any,
  transform: PageTransform,
  _: Region | undefined
): ImageAnnotation[] => {
  return (data.pages as any[]).reduce<ImageAnnotation[]>((all, page) => {
    const blocks: MistralOCRBlock[] = page.blocks || [];

    const onThisPage = blocks
      .filter(b => b.content?.trim())
      .map(b => createBlockAnnotation(b, transform));

    return [...all, ...onThisPage];
  }, []);
}