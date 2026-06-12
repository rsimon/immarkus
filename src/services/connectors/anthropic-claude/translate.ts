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
    'https://api.anthropic.com/v1',
    model,
    generator, 
    lang,
    { 
      'anthropic-dangerous-direct-browser-access': 'true' 
    }
  );

}