import { PageTransform, ServiceRequestArgs } from '@/services/Types';
import { transcribeOpenAICompatible } from '@/services/utils';

export const transcribe = (image: File | string, _t: PageTransform, args: ServiceRequestArgs = {}) => {
  const { options = {} } = args;
  const url = options['url'];
  const model = options['model'];
  const apiKey = options['api-key'];

  if (!url || !model)
    throw new Error('Invalid configuration');

  const generator = {
    id: model,
    name: model,
    homepage: url
  };

  return transcribeOpenAICompatible(
    image,
    apiKey,
    url,
    model,
    generator, 
    args
  );

}