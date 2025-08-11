import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'anthropic-claude',
  connector: 'anthropic-claude',
  displayName: 'Anthropic Claude',
  requiresKey: true,
  services: [{
    type: 'TRANSCRIPTION',
    description: 'Full-text transcription via Anthropic Claude',
    requiresRegion: true,
    parameters: [{
      type: 'credential',
      id: 'api-key',
      displayName: 'Your API Key',
      required: true
    }]
  }, {
    type: 'TRANSLATION'
  }]
};