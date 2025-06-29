import { fileToBase64 } from '@/services/utils';
import { OpenAI } from 'openai';

export const submit = (image: File | string, options: Record<string, any> = {}) => {
  const model = options['model'];
  const key = options['api-key'];

  // Should never happen
  if (!model || !key)
    throw new Error(`Missing access configuration`);

  const client = new OpenAI({
    apiKey: key,
    baseURL: 'https://api.kluster.ai/v1',
    dangerouslyAllowBrowser: true
  });

  const submit = (imageUrl: string) =>
    client.chat.completions.create({
      model,
      max_completion_tokens: 4000,
      temperature: 0.1, // Low temperature for consistent JSON
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: `Extract ALL text from this image. Your response must be ONLY valid JSON in this exact format:

{"text": "all extracted text goes here"}

Find every word, label, title, number, and text element. Put all the text in a single string. Return ONLY the JSON object, no markdown, no explanations.`
        },{
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        }]
      }]
    });

  if (typeof image === 'string') {
    return submit(image);
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }

}