import { translateOpenAICompatible } from '@/services/utils';

export const translate = (text: string, options?: Record<string, any>) => {
  const key = options['api-key'];

  // Should never happen
  if (!key)
    throw new Error('Missing API key');

  return translateOpenAICompatible(
    text,
    key,
    'https://ark.cn-beijing.volces.com/api/v3',
    'doubao-1.5-vision-pro-250328',
    { 
      id: 'doubao-1.5-vision-pro-250328',
      name: 'VolcEngine (doubao-1.5-vision-pro-250328)',
      homepage: 'https://www.volcengine.com/'
    }
  );

}