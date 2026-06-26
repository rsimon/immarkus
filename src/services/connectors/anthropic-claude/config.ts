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
    required: true,
  }, {
    type: 'string',
    id: 'model',
    displayName: 'Model',
    required: true,
    persist: true,
    options: [
      ['claude-opus-4-8', 'Claude Opus 4.8'],
      ['claude-sonnet-4-6', 'Claude Sonnet 4.6']
    ]
  }],
  services: [{
    type: 'TRANSCRIPTION',
    description: 'Full-text transcription via Anthropic Claude',
    requiresRegion: true
  }, {
    type: 'TRANSLATION'
  }]
};