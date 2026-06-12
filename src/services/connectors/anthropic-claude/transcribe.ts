import { transcribeOpenAICompatible } from '@/services/utils';

export const transcribe = (image: File | string, options?: Record<string, any>) => {
  const apiKey = options['api-key'];
  const model = options['model'];

  // Should never happen
  if (!apiKey)
    throw new Error('Missing API key');

  const generator = {
    id: model,
    name: `Claude (${model})`,
    homepage: 'https://www.anthropic.com/api'
  };

  return transcribeOpenAICompatible(
    image,
    apiKey,
    'https://api.anthropic.com/v1',
    model,
    generator, 
    { 
      'anthropic-dangerous-direct-browser-access': 'true' 
    }
  );

}