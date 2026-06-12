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
      ['claude-opus-4-20250514', 'Claude Opus 4'],
      ['claude-fable-5', 'Claude Fable 5'],
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