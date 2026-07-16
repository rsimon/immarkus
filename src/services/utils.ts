import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { ShapeType } from '@annotorious/react';
import type { AnnotationBody, ImageAnnotation } from '@annotorious/react';
import { EntityType, PropertyDefinition } from '@/model';
import { 
  Generator, 
  PageTransform, 
  Region, 
  TranscriptionServiceResponse, 
  TranslationServiceResponse 
} from './Types';

export const PROMPT_TRANSCRIBE = 
`Extract all text from this image. Your response must be ONLY valid JSON in this format: 

{ "text": "all extracted text goes here" } 
 
Preserve whitespace and newline formatting in the text output.`;

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
): Promise<TranscriptionServiceResponse> => {
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
      max_completion_tokens: 4000,
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
    }).then((data: any) => ({ generator, data } as TranscriptionServiceResponse));
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
    // Strip markdown container, if any
    const match = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, result];
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

// Compiles a prompt line for one property
const propertyToPrompt = (p: PropertyDefinition): string | undefined => {
  const instructions = p.description ? ` — ${p.description}` : '';

  switch (p.type) {
    case 'text':
      return p.multiple
        ? `* "${p.name}": array of strings, [] if none${instructions}`
        : `* "${p.name}": string, or null if the text does not state it${instructions}`;

    case 'number':
      return `* "${p.name}": number, or null if the text does not state it${instructions}`;

    case 'enum': {
      const opts =  p.values.map((v) => `"${v}"`).join(", ");
      return p.multiple
        ? `* "${p.name}": array containing any of [${opts}], [] if none apply. Use the listed values exactly; never invent a new one${instructions}`
        : `* "${p.name}": exactly one of [${opts}], or null. Use the listed values exactly; never invent a new one${instructions}`;
    }

    default:
      // omit other types
      return undefined;
  }
}

const tagToPrompt = (tag: EntityType): string => {
  const lines = (tag.properties || []).map(propertyToPrompt);

  return [
    `### Class: "${tag.id}"`,
    tag.label && tag.label !== tag.id ? `Also known as: ${tag.label}` : undefined,
    tag.description,
    lines.length > 0 ? `Fields to fill:\n${lines.join("\n")}` : `This class has no extractable fields; still report its mentions.`,
  ].filter(Boolean).join('\n');
};

export const buildTranscribeAndTagPrompt = (tags: EntityType[], instructions?: string): string => {
  if (tags.length === 0) return PROMPT_TRANSCRIBE;

  const classIds = tags.map((t) => `"${t.id}"`);

  return `You are an expert annotator assisting with the scholarly transcription of historical sources. The attached image is a region selected from a larger document by a researcher.

## Task 1: Transcription

Transcribe all text visible in the image.
${instructions ? `\n${instructions}\n` : ""}
* Reproduce the original characters exactly. Do not modernize, translate, or add punctuation that is not in the source.
* Preserve line breaks as they appear.
* Use ○ for characters you cannot read. Never substitute a guess.

## Task 2: Entity extraction

From your transcription, list every individual entity that belongs to one of the classes below.

${tags.map((t) => tagToPrompt(t)).join("\n\n")}

## Rules

* List each individual entity as one list item in 'entities' array. Do not merge the properties of different entity instances into the same list item. 
* List each individual entity **instance** exactly once. That means: create different list items for different entity instances (e.g. different persons), but don't create multiple list items for mulitple **mentions** of the same instance.
* Include the entity instance in the list even if you can fill only a single property. It's ok to leave some properties blank. As long as you can fill at least one property, 
* If the image contains no legible text, return an empty "text" and an empty "entities" array.

## Output format

Respond with a single JSON object and nothing else — no markdown fences, no commentary:

{
  "text": "<the full transcription from Task 1>",
  "entities": [
    {
      "class": "${classIds[0]}",
      "properties": {
        <field name>: <value, as specified per class above>
      }
    },{
      "class": "${classIds[0]}",
      "properties": {
        <field name>: <value, as specified per class above>
      }
    }${classIds.length > 1 ? `, {
      "class": "${classIds[1]}",
      "properties": {
        <field name>: <value, as specified per class above>
      }
    }` : ''}
  ]
}`;
}