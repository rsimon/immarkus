import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { HeadersLike } from 'node_modules/openai/internal/headers.mjs';
import { ShapeType } from '@annotorious/react';
import type { AnnotationBody, ImageAnnotation } from '@annotorious/react';
import { Generator, PageTransform, Region, ServiceConnectorResponse } from './Types';

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

export const submitOpenAICompatible = (
  image: File | string, 
  apiKey: string,
  baseURL: string,
  model: string,
  generator: Generator,
  defaultHeaders?: HeadersLike
): Promise<ServiceConnectorResponse> => {
  const client = new OpenAI({ 
    apiKey, 
    baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders
  });

  const submit = (imageUrl: string) =>
    client.chat.completions.create({
      model,
      max_completion_tokens: 4000,
      temperature: 0.1, // Low temperature for consistent JSON
      response_format: {
        type: 'json_object'
      },
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: 'Extract all text from this image. Your response must be ONLY valid JSON in this format: { "text": "all extracted text goes here" } Preserve whitespace and newline formatting in the text output.'
        },{
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        }]
      }]
    }).then((data: any) => ({ generator, data } as ServiceConnectorResponse));

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }

}

export const parseOpenAICompatibleResponse = (data: any, _: PageTransform, region: Region): ImageAnnotation[] => {
  const choices = (data.choices || []);
  if (choices.length === 0) {
    console.warn('Repsonse with no choices', data);
    return [];
  }

  const result = choices.find(c => c.message.content)?.message?.content;
  if (!result) {
    console.warn('Response with no result content', data);
    return [];
  }

  const parseResponseContent = (str: string) => {
    // Strip markdown container, if any
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, str];
    return JSON.parse(match[1]).text;
  }

  try {
    const text = parseResponseContent(result);
    if (!text)
      throw new Error('Could not parse response');

    const id = uuidv4();

    return [{
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
    }];
  } catch (error) {
    console.error(data);
    console.error(error);
    throw error;
  }
}