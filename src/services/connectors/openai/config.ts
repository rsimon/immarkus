import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'open-ai-gpt',
  connector: 'openai',
  displayName: 'OpenAI GPT',
  description: 'Full-text transcription via OpenAI GPT',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'api_key',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  }],
  keyInstructions: `
You need an API key to use the OpenAI API. Note that OpenAI image analysis is a **paid service**! 

To get your own key:

- Go to <https://platform.openai.com/>
- Choose **API keys** from the sidebar
- Click **Create a new secret key**
- Make sure that you have a payment method configured in your profile's billing settings
`
};