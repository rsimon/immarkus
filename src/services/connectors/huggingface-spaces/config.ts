import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'huggingface-spaces',
  connector: 'huggingface-spaces',
  displayName: 'HuggingFace Spaces',
  description: 'Use your own model on HuggingFace Spaces',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'credential',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  },{
    type: 'string',
    id: 'endpoint',
    displayName: 'Endpoint URL',
    persist: true
  }]
};