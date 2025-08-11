import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'azure-cv',
  connector: 'azure-cv',
  displayName: 'Azure Computer Vision',
  requiresKey: true,
  services: [{
    type: 'TRANSCRIPTION',
    description: 'OCR via Microsoft Azure Computer Vision',
    parameters: [{
      type: 'string',
      id: 'endpoint',
      displayName: 'Azure Endpoint',
      required: true,
      persist: true
    }, {
      type: 'credential',
      id: 'key',
      displayName: 'Key',
      required: true
    }]
  }]
};