import { InferenceClient } from '@huggingface/inference';
import { fileToBase64, urlToBase64 } from '@/services/utils';
import { ServiceConnectorResponse } from '@/services/Types';

export const submit = (image: File | string, options?: Record<string, any>) => {
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

  const submit = (imageUrl: string) =>
    client.chatCompletion({
      model,
      messages: [
        {
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
        },
      ],
    }).then((data: any) => ({ generator, data } as ServiceConnectorResponse));

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}