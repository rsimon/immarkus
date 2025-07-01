import { fileToBase64, urlToBase64 } from '@/services/utils';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export const submit = (image: File | string, options?: Record<string, any>) => {
  const apiKey = options['api-key'];

  const client = new OpenAI({ 
    apiKey, 
    baseURL: 'https://api.anthropic.com/v1',
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'anthropic-dangerous-direct-browser-access': 'true'
    }
  });

  const submit = (imageUrl: string) =>
    client.chat.completions.create({
      model: 'claude-opus-4-20250514',
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
    });

    if (typeof image === 'string') {
      return urlToBase64(image).then(base64 =>  
        submit(`data:image/jpeg;base64,${base64}`));
    } else {
      return fileToBase64(image as File).then(base64 => 
        submit(`data:image/jpeg;base64,${base64}`));
    }

  }