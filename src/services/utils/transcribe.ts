import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { fileToBase64, parseOpenAIResponse, urlToBase64 } from './shared';
import { buildTranscribeAndTagPrompt, PROMPT_TRANSCRIBE } from './prompts';
import type { 
  AnnotationServiceCrosswalkResponse, 
  AnnotationServiceResponse, 
  Generator, 
  PageTransform, 
  Region 
} from '../Types';

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

export const parseOpenAICompatibleTranscriptionResponse = (data: any, _: PageTransform, region: Region): AnnotationServiceCrosswalkResponse => {
  try {
    const result = parseOpenAIResponse(data);
    if (!result?.text)
      throw new Error('Could not parse response');

    const id = uuidv4();

    const annotations = [{
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

    return { annotations };
  } catch (error) {
    console.error(data);
    console.error(error);
    throw error;
  }
}