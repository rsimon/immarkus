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
    requiresRegion: true,
    parameters: [{
      type: 'string',
      id: 'model',
      displayName: 'Model',
      required: true,
      persist: true,
      options: [
        ['gemini-3.8-flash', 'Gemini 3.8 Flash'],
        ['gemini-3.7-flash', 'Gemini 3.7 Flash'],
        ['gemini-3.6-flash', 'Gemini 3.6 Flash'],
        ['gemini-3.5-flash', 'Gemini 3.5 Flash'],
        ['gemini-3.5-flash-lite', 'Gemini 3.5 Flash Lite'],
        ['gemini-3.1-flash-lite', 'Gemini 3.1 Flash Lite'],
        ['gemini-3.1-pro-preview', 'Gemini 3.1 Pro (Preview)'],
        ['gemini-2.5-pro', 'Gemini 2.5 Pro'],
        ['gemini-2.5-flash', 'Gemini 2.5 Flash'],
        ['gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite']
      ]
    }]
  },{
    type: 'TRANSLATION'
  }]
};