import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'open-ai-gpt',
  connector: 'openai',
  displayName: 'OpenAI GPT',
  requiresKey: true,
  keyInstructions: `
You need an API key to use the OpenAI API. Note that OpenAI image analysis is a **paid service**! 

To get your own key:

- Go to <https://platform.openai.com/>
- Choose **API keys** from the sidebar
- Click **Create a new secret key**
- Make sure that you have a payment method configured in your profile's billing settings
`.trim(),
  services: [{
    type: 'TRANSCRIPTION',
    description: 'Full-text transcription via OpenAI GPT',
    requiresRegion: true,
    parameters: [{
      type: 'credential',
      id: 'api-key',
      displayName: 'Your API Key',
      required: true
    }]
  }]
};