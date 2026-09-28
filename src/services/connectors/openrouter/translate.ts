import { translateOpenAICompatible } from '@/services/utils';

export const translate = (text: string, lang?: string, options?: Record<string, any>) => {
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

  return translateOpenAICompatible(
    text,
    apiKey,
    'https://openrouter.ai/api/v1',
    model,
    generator, 
    lang
  );

}