import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'mistral',
  connector: 'mistral',
  displayName: 'Mistral',
  services: [{
    type: 'TRANSCRIPTION',
    description: 'OCR by Mistral.ai',
    requiresRegion: true,
    parameters: [{
      type: 'string',
      id: 'model',
      displayName: 'Model',
      required: true,
      persist: true,
      options: [
        ['mistral-large-4', 'Mistral 4 Large'],
        ['mistral-small-2603', 'Mistral 4 Small'],
        ['mistral-ocr-4-1', 'Mistral OCR 4']
      ]
    }, {
      type: 'credential',
      id: 'api-key',
      displayName: 'Your API Key',
      required: true
    }]
  }]
};