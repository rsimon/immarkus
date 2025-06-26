import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'azure-cv',
  connector: 'azure-cv',
  displayName: 'Azure Computer Vision',
  description: 'OCR via Microsoft Azure Computer Vision',
  requiresKey: true,
  parameters: [{
    type: 'string',
    id: 'endpoint',
    displayName: 'Azure Endpoint',
    required: true,
    persist: true
  }, {
    type: 'api_key',
    id: 'key',
    displayName: 'Key',
    required: true
  }]
};