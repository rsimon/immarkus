import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'google-gemini',
  connector: 'google-gemini',
  displayName: 'Google Gemini',
  description: 'Full-text transcription via Google Gemini',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'api_key',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  }]
};