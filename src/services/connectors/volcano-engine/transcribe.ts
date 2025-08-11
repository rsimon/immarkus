import { transcribeOpenAICompatible } from '@/services/utils';

export const transcribe = (image: File | string, options: Record<string, any> = {}) => {
  const key = options['api-key'];

  // Should never happen
  if (!key)
    throw new Error('Missing API key');

  return transcribeOpenAICompatible(
    image,
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