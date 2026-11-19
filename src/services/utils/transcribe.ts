import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { buildTranscribeAndTagPrompt, PROMPT_TRANSCRIBE } from './prompts';
import { fileToBase64, parseOpenAIResponse, urlToBase64 } from './shared';
import type { 
  AnnotationServiceCrosswalkResponse, 
  AnnotationServiceResponse, 
  EntityReference, 
  EntityTagAnnotationBody, 
  Generator, 
  PageTransform, 
  Region,
  ServiceRequestArgs,
  TranscriptionAnnotationBody
} from '../Types';

export const getTranscriptionPrompt = (tags: EntityType[] = []): string =>
  tags.length === 0 ? PROMPT_TRANSCRIBE : buildTranscribeAndTagPrompt(tags);

export const transcribeOpenAICompatible = (
  image: File | string, 
  apiKey: string,
  baseURL: string,
  model: string,
  generator: Generator,
  args: ServiceRequestArgs = {},
  defaultHeaders?: any
): Promise<AnnotationServiceResponse> => {
  const client = new OpenAI({ 
    apiKey, 
    baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders
  });

  const prompt = args.customPrompt ?? getTranscriptionPrompt(args.tags);

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

const parseMention = (
  mention: { quote: string, context: string }, 
  transcription: string
): EntityReference => {
  if (!mention)
    throw new Error('Could not parse response: empty mention');

  const { quote, context } = mention;

  if (!context.includes(quote)) {
    console.warn(mention);
    console.warn(`Could not parse response - invalid mention: context does not include quote`);
    return;
  }

  if (!transcription.includes(context)) {
    console.warn(transcription);
    console.warn(`Could not parse response: transcription does not include mention`);
    return;
  }

  const hasMatchingContext = () => {
    let contextFrom = 0;

    const contextualOccurrences = new Set<number>();
    
    while (true) {
      // Outer loop: next occurrence of context in transcription
      const contextStart = transcription.indexOf(context, contextFrom);
      if (contextStart === -1)
        break;

      let quoteFrom = 0;

      while (true) {
        // Inner loop: next occurrence of quote in context
        const quoteOffset = context.indexOf(quote, quoteFrom);
        if (quoteOffset === -1)
          break;

        contextualOccurrences.add(contextStart + quoteOffset);
        quoteFrom = quoteOffset + 1;
      }

      contextFrom = contextStart + 1;
    }

    if (contextualOccurrences.size !== 1) {
      console.warn(`Could not uniquely locate mention: "${quote}"`);
      return false;
    }

    return true;
  }

 
  if (!hasMatchingContext()) return;
    
  const start = transcription.indexOf(quote, transcription.indexOf(context));
  const end = start + quote.length;
  return { start, end, quote };
}

export const crosswalkSimpleTranscriptionPayload = (
  annotationId: string, 
  result: any
): AnnotationBody[] => ([{
    id: uuidv4(),
    annotation: annotationId,
    purpose: 'transcribing',
    value: [{
      content: result.text
    }]
  } as TranscriptionAnnotationBody, 
  ...(result.entities || []).map(entity => ({
    id: uuidv4(),
    annotation: annotationId,
    type: 'Dataset',
    purpose: 'classifying',
    source: entity.class,
    properties: entity.properties,
    references: entity.mentions.map(m => parseMention(m, result.text)).filter(Boolean)
  } as EntityTagAnnotationBody))]);

export const parseSimpleOpenAICompatibleTranscriptionResponse = (
  data: any, 
  _: PageTransform, 
  region: Region
): AnnotationServiceCrosswalkResponse => {
  try {
    const result = parseOpenAIResponse(data);
    
    if (!result?.text)
      throw new Error('Could not parse response');

    const id = uuidv4();

    const annotations = [{
      id,
      bodies: crosswalkSimpleTranscriptionPayload(id, result),
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