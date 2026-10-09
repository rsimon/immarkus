import { Mistral } from "@mistralai/mistralai";
import { buildTranscribeAndTagPrompt, fileToBase64, urlToBase64 } from '@/services/utils';
import { AnnotationServiceResponse, PageTransform } from '@/services/Types';
import { EntityType } from '@/model';

const PROMPT_TRANSCRIBE = 
`Extract all text from this image. Your response must be ONLY valid JSON in this format: 

{ "text": "all extracted text goes here" } 
 
Preserve whitespace and newline formatting in the text output.`;

export const transcribe = (image: File | string, _t: PageTransform, options: Record<string, any> = {}, tags: EntityType[] = []) => {
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
    const prompt = tags.length === 0 ? PROMPT_TRANSCRIBE : buildTranscribeAndTagPrompt(tags);

    if (model.includes('ocr')) {
      return client.ocr.process({
        model,
        document: {
          type: 'image_url',
          imageUrl
        }
      }).then((data: any) => ({generator, data } as AnnotationServiceResponse));
    } else {
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