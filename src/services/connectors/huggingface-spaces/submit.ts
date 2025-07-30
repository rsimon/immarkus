import { Client, handle_file } from '@gradio/client';
import { urlToFile } from '@/services/utils';

const isValidEndpoint = (url: string) => {
  // TODO possibly support localhost URLs later?
  return url.startsWith('https://huggingface.co/spaces/');
}

const parseArgs = (str: string): any | undefined => {
  try {
    const optionalArgs = JSON.parse(str || '{}');
    return optionalArgs;
  } catch (error) {
    throw new Error('Malformed JSON');
  }
}

export const submit = async (image: File | string, options?: Record<string, any>) => {
  const endpoint = options['endpoint'];

  // Should never happen
  if (!endpoint)
    throw new Error('Missing access configuration');

  if (!isValidEndpoint(endpoint))
    throw new Error('Invalid endpoint URL (must start with https://huggingface.co/spaces/');

  // Make sure we're not sending an empty string!
  const accessToken = options['access-token'] ? options['access-token'] : undefined;

  const optionalArgs = parseArgs(options['optional_args']);
  
  if (!optionalArgs)
    throw new Error('Malformed arguments – must be valid JSON');

  const spaceName = endpoint.substring('https://huggingface.co/spaces/'.length);

  const generator = {
    id: spaceName,
    name: `hf:${spaceName}`,
    homepage: endpoint
  };

  const submit = async (blob: Blob) => {
    const client = await Client.connect(spaceName, {
      hf_token: accessToken
    });

    const job = await client.predict('/generate_image', { 		
      ...optionalArgs,		
      text: 'Extract all text from this image. Your response must be ONLY valid JSON in this format: { "text": "all extracted text goes here" } Preserve whitespace and newline formatting in the text output.',
      image: handle_file(blob)
    });

    const data = Array.isArray(job.data) ? job.data[0] : job.data;

    return { generator, data };
  }

  if (typeof image === 'string') {
    return urlToFile(image).then(submit);
  } else {
    return submit(image);
  }
}