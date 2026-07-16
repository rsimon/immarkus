import { InferenceClient } from '@huggingface/inference';
import { buildTranscribeAndTagPrompt, fileToBase64, urlToBase64 } from '@/services/utils';
import { TranscriptionServiceResponse } from '@/services/Types';
import { EntityType } from '@/model';
import { MOCK_RESPONSE } from './mock-response';

const PROMPT_TRANSCRIBE = 
`Extract all text from this image. Your response must be ONLY valid JSON in this format: 

{ "text": "all extracted text goes here" } 
 
Preserve whitespace and newline formatting in the text output.`;

export const transcribe = (image: File | string, options: Record<string, any> = {}, tags: EntityType[] = []) => {
  const hfToken = options['access-token'];
  const model = options['model'];

  // Should never happen
  if (!hfToken || !model)
    throw new Error('Missing access configuration');

  const generator = {
    id: model,
    name: `HuggingFace (${model})`,
    homepage: 'https://huggingface.co/docs/inference-providers'
  };

  const client = new InferenceClient(hfToken);

  const submit = (imageUrl: string) => {
    const prompt = tags.length === 0 ? PROMPT_TRANSCRIBE : buildTranscribeAndTagPrompt(tags);
    // console.log(prompt);

    // return new Promise(resolve => {
    //   resolve(MOCK_RESPONSE)
    // }).then(response => ({ generator, data: response } as TranscriptionServiceResponse));
    
    return client.chatCompletion({
      model,
      messages: [
        {
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
        },
      ],
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