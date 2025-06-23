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
  }],
  keyInstructions: `
You need an API key to use Google Gemini. To get your own key:

- Go to <https://aistudio.google.com/>
- Select **Get an API key** from the popup
`
};