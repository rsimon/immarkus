import { fileToBase64 } from '@/services/utils';

export const submit = (image: File | string, options?: Record<string, any>) => {
  if (!options || !options['api-key']) throw new Error('Missing API key');

  const apiKey = options['api-key'];

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
    });
  }

  if (typeof image === 'string') {
    return submit();
  } else {
    return fileToBase64(image as File).then(submit);
  }

}