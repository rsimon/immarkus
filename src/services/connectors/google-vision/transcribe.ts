import { TranscriptionServiceResponse } from '@/services/Types';
import { fileToBase64, urlToBase64 } from '@/services/utils';

export const transcribe = (
  image: File | string, 
  options?: Record<string, any>
): Promise<TranscriptionServiceResponse> => {
  if (!options || !options['api-key']) throw new Error('Missing API key');

  const apiKey = options['api-key'];

  const generator = {
    id: 'google-vision',
    name: 'Google Cloud Vision API',
    homepage: 'https://cloud.google.com/vision'
  };

  const submit = (base64?: string) => {
    const payload = {
      requests: [{
        image: base64 ? {
          content: base64
        } : {
          source: {
            imageUri: image
          }
        },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 1
        }]
      }]
    }

    return fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        return res.json().then(errorResponse => {
          const message = errorResponse.error?.message;
          throw new Error(message);
        });
      }
    }).then(data => ({ data, generator }));
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(submit);
  } else {
    return fileToBase64(image as File).then(submit);
  }

}