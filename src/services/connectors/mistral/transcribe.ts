import { Mistral } from '@mistralai/mistralai';
import { fileToBase64, getTranscriptionPrompt, urlToBase64 } from '@/services/utils';
import { AnnotationServiceResponse, PageTransform, ServiceRequestArgs } from '@/services/Types';
import { EntityType } from '@/model';

export const getPrompt = (options?: Record<string, any>, tags: EntityType[] = []): string | undefined =>
  options?.model?.includes('ocr') ? undefined : getTranscriptionPrompt(tags);

export const transcribe = (image: File | string, _t: PageTransform, args: ServiceRequestArgs = {}) => {
  const { options = {}, tags = [], customPrompt } = args;
  const apiKey = options['api-key'];
  const model = options['model'] as string;

  // Should never happen
  if (!apiKey || !model)
    throw new Error('Missing access configuration');

  const generator = {
    id: model,
    name: `Mistral (${model})`,
    homepage: 'https://docs.mistral.ai/api'
  };

  const client = new Mistral({ apiKey });

  const submit = (imageUrl: string) => {
    if (model.includes('ocr')) {
      return client.ocr.process({
        model,
        document: {
          type: 'image_url',
          imageUrl
        }
      }).then((data: any) => ({generator, data } as AnnotationServiceResponse));
    } else {
      const prompt = customPrompt ?? getPrompt(options, tags);
      if (!prompt)
        throw new Error('Missing transcription prompt');

      return client.chat.complete({
        model,
        maxTokens: 4000,
        messages: [
          {
            role: 'user',
            content: [{
              type: 'text',
              text: prompt
            },{
              type: 'image_url',
              imageUrl
            }]
          },
        ],
      }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));
    }
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}