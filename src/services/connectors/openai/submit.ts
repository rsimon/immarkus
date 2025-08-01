import { ServiceConnectorResponse } from '@/services/Types';
import { fileToBase64, urlToBase64 } from '@/services/utils';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export const submit = (
  image: File | string, 
  options?: Record<string, any>
): Promise<ServiceConnectorResponse> => {
  const apiKey = options['api-key'];

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const generator = {
    id: 'gpt-4.1',
    name: 'OpenAI GPT (gpt-4.1)',
    homepage: 'https://openai.com/index/openai-api/'
  };

  const Transcription = z.object({ text: z.string() });

  const submit = (image_url: string) => 
    openai.responses.create({
      model: 'gpt-4.1',
      input:[{
        role: 'user',
        content: [
          { type: 'input_text', text: 'Transcribe the text on this is image.' },
          { 
            type: 'input_image', 
            image_url,
            detail: 'auto' 
          }
        ]
      }],
      text: {
        format: zodTextFormat(Transcription, 'transcriptions')
      }
    }).then(data => ({ data, generator }));

    if (typeof image === 'string') {
      return urlToBase64(image).then(base64 =>  
        submit(`data:image/jpeg;base64,${base64}`));
    } else {
      return fileToBase64(image as File).then(base64 => 
        submit(`data:image/jpeg;base64,${base64}`));
    }

  }