import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'anthropic-claude',
  connector: 'anthropic-claude',
  displayName: 'Anthropic Claude',
  requiresKey: true,
  parameters: [{
    type: 'credential',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  }],
  services: [{
    type: 'TRANSCRIPTION',
    description: 'Full-text transcription via Anthropic Claude',
    requiresRegion: true
  }, {
    type: 'TRANSLATION'
  }]
};