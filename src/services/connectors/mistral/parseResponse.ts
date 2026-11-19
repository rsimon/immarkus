import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { AnnotationServiceCrosswalkResponse, PageTransform, Region } from '@/services/Types';
import { parseSimpleOpenAICompatibleTranscriptionResponse as parseOpenAI } from '@/services/utils';

interface MistralOCRBlock {

  topLeftX: number;
  
  topLeftY: number;
  
  bottomRightX: number;
  
  bottomRightY: number;
  
  content: string;
  
  type: string;

}

const toAnnotation = (text: string, region: Region, entities: any[]): ImageAnnotation => {
  const id = uuidv4();

  return {
    id,
    bodies: [{
      annotation: id,
      purpose: 'transcribing',
      value: text
    }, ...entities.map(e => ({
      id: uuidv4(),
      annotation: id,
      type: 'Dataset',
      purpose: 'classifying',
      source: e.class,
      properties: e.properties,
      // references: e.mentions.map(m => parseMention(m, text)).filter(Boolean)
    }))] as AnnotationBody[],
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

const createBlockAnnotation = (block: MistralOCRBlock, transform: PageTransform, entities: any[]): ImageAnnotation => {
  const { topLeftX, topLeftY, bottomRightX, bottomRightY, content } = block;

  const region = transform({
    x: topLeftX,
    y: topLeftY,
    w: bottomRightX - topLeftX,
    h: bottomRightY - topLeftY
  });

  return toAnnotation(content, region, entities);
}

export const parseResponse = (
  data: any,
  transform: PageTransform,
  region: Region
): AnnotationServiceCrosswalkResponse => {
  if ('pages' in data) {
    console.log(data);
    const entities = 'documentAnnotation' in data ? JSON.parse(data.documentAnnotation).entities : [];

    // OCR response

    const annotations = (data.pages as any[]).reduce<ImageAnnotation[]>((all, page) => {
      const blocks: MistralOCRBlock[] = page.blocks || [];

      const onThisPage = blocks
        .filter(b => b.content?.trim())
        .map(b => createBlockAnnotation(b, transform, entities));

      return [...all, ...onThisPage];
    }, []);

    return { annotations };
  } else {
    // LLM response
    return parseOpenAI(data, transform, region);
  }
}