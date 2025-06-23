import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'open-ai-gpt',
  connector: 'openai',
  displayName: 'OpenAI GPT',
  description: 'Transcribe text in an image area with OpenAI GPT.',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'api_key',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  }]
};