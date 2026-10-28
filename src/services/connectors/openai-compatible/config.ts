import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'open-ai-custom',
  connector: 'openai-compatible',
  displayName: 'Custom Endpoint (OpenAI-compatible)',
  parameters: [{
    type: 'string',
    id: 'url',
    displayName: 'Endpoint URL',
    required: true,
    persist: true
  },{
    type: 'string',
    id: 'model',
    displayName: 'Model ID',
    required: true,
    persist: true,
  },{
    type: 'credential',
    id: 'api-key',
    displayName: 'API Key (if required)'
  }],
  services: [{
    type: 'ANNOTATION',
    description: 'Annotation via your own custom endpoint'
  },{
    type: 'TRANSCRIPTION',
    description: 'Full-text transcription via custom endpoint',
    requiresRegion: true
  }]
};