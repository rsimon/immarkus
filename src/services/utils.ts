import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { ShapeType } from '@annotorious/react';
import type { AnnotationBody, ImageAnnotation } from '@annotorious/react';
import { EntityType } from '@/model';
export { buildImageAnnotationPrompt, tagToPrompt } from './annotationPrompt';
import { buildTranscribeAndTagPrompt, PROMPT_TRANSCRIBE } from './prompts';
import { 
  AnnotationServiceResponse,
  Generator, 
  PageTransform, 
  Region,
  TranslationServiceResponse
} from './Types';

export const fileToBase64 = (file: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    // Remove the data URL prefix
    const base64 = (reader.result as string).split(',')[1];
    resolve(base64);
  };

  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const urlToBase64 = (url: string): Promise<string> =>
  fetch(url)
    .then(res => res.blob())
    .then(fileToBase64);

export const urlToFile = (url: string): Promise<File> =>
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      let filename: string;

      const urlPath = new URL(url).pathname;
      const urlFilename = urlPath.split('/').pop();
    
      if (urlFilename && urlFilename.includes('.')) {
        filename = urlFilename;
      } else {
        const mimeType = blob.type;
        const extension = mimeType.split('/')[1] || 'jpg'; // Default to jpg
        filename = `image.${extension}`;
      }
  
      return new File([blob], filename, {
        type: blob.type,
        lastModified: Date.now()
      });
    });

export const transcribeOpenAICompatible = (
  image: File | string, 
  apiKey: string,
  baseURL: string,
  model: string,
  generator: Generator,
  tags: EntityType[] = [],
  defaultHeaders?: any
): Promise<AnnotationServiceResponse> => {
  const client = new OpenAI({ 
    apiKey, 
    baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders
  });

  const prompt = tags.length === 0 ? PROMPT_TRANSCRIBE : buildTranscribeAndTagPrompt(tags);

  const submit = (imageUrl: string) => {    
    return client.chat.completions.create({
      model,
      max_completion_tokens: 12000,
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
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}

export const parseOpenAIResponse = (data: any) => {
  const choices = (data.choices || []);
  if (choices.length === 0) {
    console.warn('Response with no choices', data);
    return;
  }

  const result = choices.find(c => c.message.content)?.message?.content;
  if (!result) {
    console.warn('Response with no result content', data);
    return;
  }

  try {
    const str = Array.isArray(result) ? result.find(r => r.type === 'text')?.text : result;
    
    // Strip markdown container, if any
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, str];
    return JSON.parse(match[1]);
  } catch (error) {
    console.error(data);
    console.error(error);
    console.error('Could not parse OpenAI response');
    return;
  }
}

export const parseTranscriptionResponseBodies = (annotationId: string, result: any): AnnotationBody[] => ([{
  id: uuidv4(),
  annotation: annotationId,
  purpose: 'commenting',
  value: result.text
}, ...(result.entities || []).map(entity => ({
  id: uuidv4(),
  annotation: annotationId,
  type: 'Dataset',
  purpose: 'classifying',
  source: entity.class,
  properties: entity.properties
}))]);

export const parseOpenAICompatibleTranscriptionResponse = (data: any, _: PageTransform, region: Region): ImageAnnotation[] => {
  try {
    const result = parseOpenAIResponse(data);
    if (!result?.text)
      throw new Error('Could not parse response');

    const id = uuidv4();

    return [{
      id,
      bodies: parseTranscriptionResponseBodies(id, result),
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
  } catch (error) {
    console.error(data);
    console.error(error);
    throw error;
  }
}

// Rotation-aware transformation from rectangle to Rect annotation
export const transformRectangle = (
  transform: PageTransform,
  rectangle: { x: number, y: number, w: number, h: number }
) => {
  const corners = [
    transform({ x: rectangle.x, y: rectangle.y }),
    transform({ x: rectangle.x + rectangle.w, y: rectangle.y }),
    transform({ x: rectangle.x + rectangle.w, y: rectangle.y + rectangle.h }),
    transform({ x: rectangle.x, y: rectangle.y + rectangle.h })
  ];

  const [topLeft, topRight, , bottomLeft] = corners;
  const center = {
    x: corners.reduce((sum, point) => sum + point.x, 0) / corners.length,
    y: corners.reduce((sum, point) => sum + point.y, 0) / corners.length
  };

  const w = Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y);
  const h = Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y);

  const rotation = Math.atan2(topRight.y - topLeft.y, topRight.x - topLeft.x);
  
  const xs = corners.map(point => point.x);
  const ys = corners.map(point => point.y);

  return {
    x: center.x - w / 2,
    y: center.y - h / 2,
    w,
    h,
    rot: rotation,
    bounds: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys)
    }
  };
}

const label = new Intl.DisplayNames(['en'], { type: 'language' });

export const getLanguageName = (iso: string) => label.of(iso);

export const translateOpenAICompatible = (
  text: string,
  apiKey: string,
  baseURL: string,
  model: string,
  generator: Generator,
  language?: string,
  defaultHeaders?: any
): Promise<TranslationServiceResponse> => {
  const client = new OpenAI({ 
    apiKey, 
    baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders
  });

  const lang = language ? getLanguageName(language) : 'English';

  return client.chat.completions.create({
      model,
      max_completion_tokens: 4000,
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: `Guess the language of this text and translate it text to ${lang}. Your response must be ONLY valid JSON in this format: { "translation": "all translated text goes here", "language": "the guessed language, as ISO code" }`
        },{
          type: 'text',
          text
        }]
      }]
    }).then((data: any) => { 
      const result = parseOpenAIResponse(data);
      if (!result) throw new Error('OpenAI response parse error');
      const { translation, language } = result;
      return { generator, translation, language } as TranslationServiceResponse;
    });
}