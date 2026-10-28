import { Mistral } from '@mistralai/mistralai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ShapeType } from '@annotorious/react';
import { EntityType, RelationshipType } from '@/model';
import { AnnotationServiceCrosswalkResponse, AnnotationServiceResponse, PageTransform } from '@/services';
import { buildAnnotatePrompt } from '@/services/utils/prompts';
import { 
  fileToBase64, 
  parseOpenAIResponse, 
  urlToBase64 
} from '@/services/utils';

interface Detection {

  category: string;

  label: string;

  bbox: { x_min: number, y_min: number, x_max: number, y_max: number };

  properties: Record<string, any>;

}

const sniffScale = (detections: Detection[]): number => {
  const values = detections.flatMap(d => {
    const { x_min, y_min, x_max, y_max } = d.bbox;
    return [x_min, y_min, x_max, y_max];
  }).filter(Number.isFinite);

  const max = Math.max(...values);

  return (max <= 1) ? 1 : 1000;
}

export const annotate = (
  image: File | string,
  transform: PageTransform,
  options?: Record<string, any>,
  tags: EntityType[] = [],
  relations: RelationshipType[] = []
) => {
  const apiKey = options['api-key'];
  const model = options['model'];

  if (!apiKey)
    throw new Error('Missing API key');

  const generator = {
    id: model,
    name: `Mistral (${model})`,
    homepage: 'https://docs.mistral.ai/api'
  };

  const client = new Mistral({ apiKey });
  
  const submit = (imageUrl: string) => { 
    const prompt = buildAnnotatePrompt(transform.source.width, transform.source.height, tags, relations);

    return client.chat.complete({
      model,
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: prompt
        },{
          type: 'image_url',
          imageUrl
        }]
      }]
    }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));
  
    /*
    return Promise.resolve(({
      generator,
      data: MOCK_RESPONSE
    }));
    */
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}

export const parseAnnotationResponse = (data: any, transform: PageTransform): AnnotationServiceCrosswalkResponse => {
  const payload: Detection[] = parseOpenAIResponse(data);
  console.debug('LLM response', payload);

  const scale = sniffScale(payload);
  console.log({ scale });

  const annotations = payload.map(detection => {
    const id = uuidv4();

    const { width, height } = transform.source;

    // Normalized (0,1) on source width / height
    const { x_min, y_min, x_max, y_max } = detection.bbox;

    const isValid = [x_min, y_min, x_max, y_max]
      .every(n => Number.isFinite(n) && n >= 0 && n <= scale)
      && x_max > x_min && y_max > y_min;

    if (!isValid) {
      console.warn(detection);
      console.warn('Skipping invalid detection');
      return;
    }

    const { x, y, w, h } = transform({
      x: (x_min * width) / scale,
      y: (y_min * height) / scale,
      w: (x_max - x_min) * width / scale,
      h: (y_max - y_min) * height / scale
    });

    return {
      id,
      bodies: [{
        annotation: id,
        purpose: 'commenting',
        value: detection.label
      }, {
        annotation: id,
        purpose: 'classifying',
        type: 'Dataset',
        source: detection.category,
        properties: detection.properties
      }] as AnnotationBody[],
      target: {
        annotation: id,
        selector: {
          type: ShapeType.RECTANGLE,
          geometry: {
            x, y, w, h,
            bounds: {
              minX: x,
              minY: y,
              maxX: x + w,
              maxY: y + h
            }
          }
        }
      }
    }
  }).filter(Boolean);

  return { annotations };
}