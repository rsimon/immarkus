import { InferenceClient } from '@huggingface/inference';
import { fileToBase64, urlToBase64 } from '@/services/utils';
import { getPrompt } from '@/services/utils/transcribe';
import { AnnotationServiceResponse, PageTransform, ServiceRequestArgs } from '@/services/Types';
import { EntityType } from '@/model';

export { getPrompt };

export const transcribe = (image: File | string, _t: PageTransform, args: ServiceRequestArgs = {}) => {
  const { options = {}, tags = [], customPrompt } = args;
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
    const prompt = customPrompt ?? getPrompt(tags);

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
    }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}