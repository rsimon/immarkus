import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'volcano-engine',
  connector: 'volcano-engine',
  displayName: 'Volcano Engine',
  description: 'Doubao 1.5 Vision Pro via Volcano Engine',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'api_key',
    id: 'api-key',
    displayName: 'Your Volcano Engine API Key',
    required: true
  }]
};