import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'google-vision',
  connector: 'google-vision',
  displayName: 'Google Vision',
  description: 'OCR text detection via the Google Cloud Vision API.',
  requiresKey: true,
  parameters: [{
    type: 'api_key',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  }]
};