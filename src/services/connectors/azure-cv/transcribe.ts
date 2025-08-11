import { ApiKeyCredentials } from '@azure/ms-rest-js';
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import type { GetReadResultResponse } from '@azure/cognitiveservices-computervision/esm/models';
import { Generator, TranscriptionServiceResponse } from '@/services/Types';

const sleep = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

export const transcribe = (
  image: File | string, 
  options: Record<string, any> = {}
): Promise<TranscriptionServiceResponse> => {
  const endpoint = options['endpoint'];
  const key = options['key'];

  // Should never happen
  if (!endpoint || !key)
    throw new Error(`Missing access configuration`);

  const client = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }),
    endpoint
  );

  return new Promise(async (resolve, reject) => {
    try {
      let response = (typeof image === 'string') 
        ? await client.read(image)
        : await client.readInStream(image);
      
      // Operation ID is last path segment of operationLocation (a URL)
      const operationId = response.operationLocation.split('/').slice(-1)[0];

      let result: GetReadResultResponse;
      do {
        await sleep(1000);
        result = await client.getReadResult(operationId);
      } while (result.status === 'running' || result.status === 'notStarted');

      if (result.status === 'succeeded') {
        const data = result.analyzeResult;
        
        const generator: Generator = {
          id: 'ms-azure-computervision',
          name: 'MS Azure Computervision',
          homepage: 'https://azure.microsoft.com/en-us/products/ai-services/ai-vision'
        };

        resolve({ data, generator });
      } else {
        reject(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}