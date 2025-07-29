import { submitOpenAICompatible } from '@/services/utils';

export const submit = (image: File | string, options?: Record<string, any>) => {
  const apiKey = options['access-token'];
  const model = options['model'];

  // Should never happen
  if (!apiKey || !model)
    throw new Error('Missing access configuration');

  const generator = {
    id: model,
    name: `HuggingFace (${model})`,
    homepage: 'https://huggingface.co/docs/inference-providers'
  };

  return submitOpenAICompatible(
    image,
    apiKey,
    'https://router.huggingface.co/v1',
    model,
    generator, 
    { 
      'anthropic-dangerous-direct-browser-access': 'true' 
    }
  );

}