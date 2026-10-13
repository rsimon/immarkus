import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { AnnotationServiceResponse, PageTransform } from '@/services';
import { 
  fileToBase64, 
  parseOpenAIResponse, 
  tagToPrompt, 
  transformRectangle,
  urlToBase64 
} from '@/services/utils';

interface Detection {

  category: string;

  label: string;

  bbox: { x_min: number, y_min: number, x_max: number, y_max: number };

  properties: Record<string, any>;

}

const buildPrompt = (w: number, h: number, tags: EntityType[]) => 
`You are identifying objects in an image. You have two tasks: 

## Task 1: Object Detection

For each object, return a bounding box as fractions of the image width and height in XYXY order, normalized to a range from 0.0 to 1.0, where (0,0) is the top-left corner and (1,1) is the bottom-right corner. Boxes should tightly enclose just that object. Include every instance you can find, not just one example per category.

## Task 2: Property extraction

For each object you identify, assign a category, and record information about it. Record **only** information that is grounded in the image. Do not infer information from your own knowledge, or interpolate information just because it seems plausible to you - any information you record must be based **only** on whatever is shown explicitly in the image.

Identify every instance of the following object types visible in the image, along with the following property fields:

${tags.map((t) => tagToPrompt(t)).join("\n\n")}

## Output format

Respond ONLY with a valid JSON object (no markdown code fences, no commentary) matching exactly this shape:

[
  {
    "category": ${tags.map(t => `"${t.id}"`).join(' | ')},
    "label": "short human-readable description",
    "bbox": { "x_min": 0.01, "y_min": 0.1, "x_max": 0.9, "y_max": 0.821 },
    "properties": {
      <field name>: <value>
    }
  }
]

Remember to normalize coordinates to the the range of [0, 1] relative to the image. Every value must be a plain decimal literal (e.g. 0.043). Never write expressions, fractions, or divisions such as "43 / 1000".
`;

const sniffScale = (detections: Detection[]): number => {
  const values = detections.flatMap(d => {
    const { x_min, y_min, x_max, y_max } = d.bbox;
    return [x_min, y_min, x_max, y_max];
  }).filter(Number.isFinite);

  const max = Math.max(...values);
  return (max <= 1) ? 1 : 1000;
}

export const annotate = (image: File | string, transform: PageTransform, options?: Record<string, any>, tags?: EntityType[]) => {
  const apiKey = options['api-key'];
  const model = options['model'];

  if (!apiKey)
    throw new Error('Missing API key');

  const generator = {
    id: model,
    name: `OpenRouter (${model})`,
    homepage: 'https://openrouter.ai/'
  };

  const client = new OpenAI({ 
    apiKey, 
    baseURL: 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true
  });
  
  const submit = (imageUrl: string) => { 
    const prompt = buildPrompt(transform.source.width, transform.source.height, tags);  

    return client.chat.completions.create({
      model,
      max_completion_tokens: 12000,
      ...({ reasoning: { max_tokens: 1000 } } as any),
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: prompt
        },{
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        }]
      }]
    }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));

    // return Promise.resolve(({
    //   generator,
    //   data: MOCK
    // }));
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}

export const parseAnnotationResponse = (data: any, transform: PageTransform): ImageAnnotation[] => {
  // console.log('[openrouter.annotate] LLM response', data);

  const payload: Detection[] = parseOpenAIResponse(data);

  const scale = sniffScale(payload);

  return payload.map(detection => {
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

    const geometry = transformRectangle(transform, {
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
          geometry
        }
      }
    }
  }).filter(Boolean);
}
