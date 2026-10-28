import OpenAI from 'openai';
import { EntityType, RelationshipType } from '@/model';
import { buildAnnotatePrompt } from '@/services/utils/prompts';
import { AnnotationServiceResponse, PageTransform } from '@/services';
import { fileToBase64, urlToBase64 } from '@/services/utils';

export const annotate = (
  image: File | string,
  transform: PageTransform,
  options?: Record<string, any>,
  tags: EntityType[] = [],
  relations: RelationshipType[] = []
) => {
  const apiKey = options['api-key'];
  const model = options['model'];

  if (!apiKey)
    throw new Error('Missing API key');

  const generator = {
    id: model,
    name: `OpenRouter (${model})`,
    homepage: 'https://openrouter.ai/'
  };

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true
  });

  const submit = (imageUrl: string) => {
    const prompt = buildAnnotatePrompt(transform.source.width, transform.source.height, tags, relations);

    return client.chat.completions.create({
      model,
      max_completion_tokens: 12000,
      ...({ reasoning: { max_tokens: 1000 } } as any),
      messages: [{
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
      }]
    }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));

    // return Promise.resolve(({
    //   generator,
    //   data: MOCK_RESPONSE
    // }));
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 =>
      submit(`data:image/jpeg;base64,${base64}`));
  }
}