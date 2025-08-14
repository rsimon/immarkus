import { translateOpenAICompatible } from '@/services/utils';

export const translate = (text: string, lang?: string, options?: Record<string, any>) => {
  const apiKey = options['api-key'];

  // Should never happen
  if (!apiKey)
    throw new Error('Missing API key');

  return translateOpenAICompatible(
    text,
    apiKey,
    'https://api.anthropic.com/v1',
    'claude-opus-4-20250514',
    { 
      id: 'claude-opus-4-20250514',
      name: 'OpenAI Claude Opus 4 (claude-opus-4-20250514)',
      homepage: 'https://www.anthropic.com/api'
    }, 
    lang,
    { 
      'anthropic-dangerous-direct-browser-access': 'true' 
    }
  );

}