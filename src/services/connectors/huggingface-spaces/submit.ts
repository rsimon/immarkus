import { submitOpenAICompatible } from '@/services/utils';

export const submit = (image: File | string, options?: Record<string, any>) => {
  const modelChoice = options['model'];
  const apiKey = options['api-key'];

  // Should never happen
  if (!modelChoice || !apiKey)
    throw new Error('Missing access configuration');

  const customEndpoint = options['custom-endpoint']
  const customModel = options['custom-model'];

  if (modelChoice === 'custom')
    if (!customEndpoint || !customModel) throw new Error('Missing access configuration');

  const model = modelChoice === 'custom' ? customModel : modelChoice;
  const endpoint = modelChoice === 'custom' ? customEndpoint : 'https://router.huggingface.co/v1';

  const generator = {
    id: model,
    name: `HF (${model})`,
    homepage: 'https://huggingface.co/'
  };

  return submitOpenAICompatible(
    image,
    apiKey,
    endpoint,
    model,
    generator, 
    { 
      'anthropic-dangerous-direct-browser-access': 'true' 
    }
  );

}