import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'volcano-engine',
  connector: 'volcano-engine',
  displayName: 'Volcano Engine',
  requiresKey: true,
  parameters: [{
    type: 'credential',
    id: 'api-key',
    displayName: 'Your Volcano Engine API Key',
    required: true
  }],
  services: [{
    type: 'TRANSCRIPTION',
    description: 'Doubao 1.5 Vision Pro via Volcano Engine',
    requiresRegion: true
  }, {
    type: 'TRANSLATION'
  }]
};