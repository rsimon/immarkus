import { translateOpenAICompatible } from '@/services/utils';

export const translate = (text: string, options?: Record<string, any>) => {
  const apiKey = options['api-key'];

  // Should never happen
  if (!apiKey)
    throw new Error('Missing API key');

  return translateOpenAICompatible(
    text,
    apiKey,
    'https://api.openai.com/v1/',
    'gpt-4.1',
    { 
      id: 'gpt-4.1',
      name: 'OpenAI GPT (gpt-4.1)',
      homepage: 'https://openai.com/index/openai-api/'
    }
  );

}