import { ServiceConnectorResponse } from '@/services/Types';
import { fileToBase64, urlToBase64 } from '@/services/utils';
import { GoogleGenAI, Type } from '@google/genai';

export const submit = (
  image: File | string, 
  options?: Record<string, any>
): Promise<ServiceConnectorResponse>  => {
  const apiKey = options['api-key'];

  const generator = {
    id: 'gemini-2.0-flash',
    name: 'Google Gemini (gemini-2.0-flash)',
    homepage: 'https://gemini.google.com/app'
  };

  const ai = new GoogleGenAI({ apiKey });

  const submit = (base64: string) => 
    ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64
        }
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: { transcription: { type: Type.STRING } },
          required: ['transcription']
        }
      }
    }).then(data => ({ data, generator }));

    if (typeof image === 'string') {
      return urlToBase64(image).then(submit);
    } else {
      return fileToBase64(image as File).then(submit);
    }
  }