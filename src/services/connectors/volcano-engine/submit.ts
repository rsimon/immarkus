import { submitOpenAICompatible } from '@/services/utils';

export const submit = (image: File | string, options: Record<string, any> = {}) => {
  const key = options['api-key'];

  // Should never happen
  if (!key)
    throw new Error('Missing API key');

  return submitOpenAICompatible(
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