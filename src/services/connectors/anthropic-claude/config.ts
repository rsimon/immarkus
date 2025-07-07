import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'anthropic-claude',
  connector: 'anthropic-claude',
  displayName: 'Anthropic Claude',
  description: 'Full-text transcription via Anthropic Claude',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'credential',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  }]
};