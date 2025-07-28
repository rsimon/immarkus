import { submitOpenAICompatible } from '@/services/utils';

export const submit = (image: File | string, options?: Record<string, any>) => {
  const model = options['model'];
  const apiKey = options['api-key'];

  // Should never happen
  if (!model || !apiKey)
    throw new Error('Missing access configuration');

  const generator = {
    id: model,
    name: `HF (${model})`,
    homepage: 'https://huggingface.co/'
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