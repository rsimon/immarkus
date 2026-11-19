import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { buildTranscribeAndTagPrompt, PROMPT_TRANSCRIBE } from './prompts';
import { fileToBase64, parseOpenAIResponse, urlToBase64 } from './shared';
import type { 
  AnnotationServiceCrosswalkResponse, 
  AnnotationServiceResponse, 
  Generator, 
  PageTransform, 
  Region,
  ServiceRequestArgs
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

type Keyed = { key: string; start: number[]; end: number[] };

// Whitespace and invisible format chars (ZWSP, ZWJ, BOM, soft hyphen) don't take part in matching
const IGNORABLE = /[\p{White_Space}\p{Cf}]/u;

const FOLD: Record<string, string> = {
  '\u2018': "'", '\u2019': "'", '\u201A': "'", '\u201B': "'",
  '\u201C': '"', '\u201D': '"', '\u201E': '"', '\u201F': '"',
  '\u2010': '-', '\u2011': '-', '\u2012': '-', '\u2013': '-', '\u2014': '-', '\u2212': '-',
};

// key[k] came from transcription.slice(start[k], end[k]); start/end are UTF-16 indices
const toKey = (text: string): Keyed => {
  let key = '';
  const start: number[] = [];
  const end: number[] = [];
  let i = 0;

  for (const ch of text) { // iterates by code point
    const next = i + ch.length;
    for (const c of (FOLD[ch] ?? ch).normalize('NFKD')) {
      if (IGNORABLE.test(c)) continue;
      key += c;
      for (let u = 0; u < c.length; u++) {
        start.push(i);
        end.push(next);
      }
    }
    i = next;
  }
  return { key, start, end };
};

const allIndexes = (haystack: string, needle: string): number[] => {
  const result: number[] = [];
  let from = 0;
  while (true) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) break;
    result.push(idx);
    from = idx + 1;
  }
  return result;
};

// Compute once per transcription and reuse for all mentions
export const parseMention = (
  mention: { quote: string; context: string },
  transcription: string,
  keyedTranscription: Keyed = toKey(transcription),
) => {
  if (!mention)
    throw new Error('Could not parse response: empty mention');

  const q = toKey(mention.quote).key;
  const c = toKey(mention.context).key;
  const t = keyedTranscription;

  if (!q || !c) {
    console.warn('Could not parse mention: empty quote or context after normalization');
    return;
  }

  const quoteOffsetsInContext = allIndexes(c, q);
  if (quoteOffsetsInContext.length === 0) {
    console.warn('Could not parse mention: context does not include quote');
    return;
  }

  const hits = new Set<number>();
  for (const contextStart of allIndexes(t.key, c))
    for (const quoteOffset of quoteOffsetsInContext)
      hits.add(contextStart + quoteOffset);

  if (hits.size !== 1) {
    console.warn(hits.size === 0
      ? 'Could not locate mention in transcription'
      : `Could not uniquely locate mention (${hits.size} candidates)`);
    return;
  }

  const [k] = hits;
  const start = t.start[k];
  const end = t.end[k + q.length - 1];
  // Return the original text slice, not the LLM's version of the quote
  return { start, end, quote: transcription.slice(start, end) };
}

export const parseTranscriptionResponseBodies = (annotationId: string, result: any): AnnotationBody[] => ([{
  id: uuidv4(),
  annotation: annotationId,
  purpose: 'transcribing',
  value: result.text
}, ...(result.entities || []).map(entity => ({
  id: uuidv4(),
  annotation: annotationId,
  type: 'Dataset',
  purpose: 'classifying',
  source: entity.class,
  properties: entity.properties,
  references: entity.mentions.map(m => parseMention(m, result.text)).filter(Boolean)
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