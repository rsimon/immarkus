import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'google-gemini',
  connector: 'google-gemini',
  displayName: 'Google Gemini',
  requiresKey: true,
  parameters: [{
    type: 'credential',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  }],
  keyInstructions: `
You need an API key to use Google Gemini. To get your own key:

- Go to <https://aistudio.google.com/>
- Select **Get an API key** from the popup`.trim(),
  services: [{
    type: 'TRANSCRIPTION',
    description: 'Full-text transcription via Google Gemini',
    requiresRegion: true
  }]
};