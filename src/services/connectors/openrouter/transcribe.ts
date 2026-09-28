import { EntityType } from '@/model';
import { transcribeOpenAICompatible } from '@/services/utils';

export const transcribe = (image: File | string, options?: Record<string, any>, tags?: EntityType[]) => {
  const apiKey = options['api-key'];
  const model = options['model'];

  // Should never happen
  if (!apiKey)
    throw new Error('Missing API key');

  const generator = {
    id: model,
    name: `OpenRouter (${model})`,
    homepage: 'https://openrouter.ai/'
  };

  return transcribeOpenAICompatible(
    image,
    apiKey,
    'https://openrouter.ai/api/v1',
    model,
    generator, 
    tags
  );

}