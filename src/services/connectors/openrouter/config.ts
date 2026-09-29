import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'openrouter',
  connector: 'openrouter',
  displayName: 'OpenRouter',
  requiresKey: true,
  keyInstructions: `
You need an API key to use OpenRouter models.

To get your own key:
- [Start here](https://openrouter.ai/) to create an OpenRouter account
- After you are logged in, click **API Keys** in the sidebar
- Click the **New Key** button
- Give the new key a name, an expiration date, and a credit limit
- Copy the key
`.trim(),
  parameters: [{
    type: 'credential',
    id: 'api-key',
    displayName: 'OpenRouter Key',
    required: true
  }],
  services: [{
    type: 'TRANSCRIPTION',
    requiresRegion: true,
    description: 'Transcription via OpenRouter',
    supportsEntityExtraction: true,
    parameters: [{
      type: 'string',
      id: 'model',
      displayName: 'Model',
      required: true,
      persist: true,
      options: [
        ['qwen/qwen3.8-27b:free', 'Qwen 3.8 27B (Free)'],
        ['qwen/qwen3.8-27b', 'Qwen 3.8 27B'],
        ['google/gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite'],
        ['openai/gpt-6-sol', 'GPT 6 Sol'],
        ['openai/gpt-6-luna', 'GPT 6 Luna']
      ]
    }]
  },{
    type: 'ANNOTATION',
    description: 'Annotation via OpenRouter',
    parameters: [{
      type: 'string',
      id: 'model',
      displayName: 'Model',
      required: true,
      persist: true,
      options: [
        ['qwen/qwen3.8-27b:free', 'Qwen 3.8 27B (Free)'],
        ['qwen/qwen3.8-27b', 'Qwen 3.8 27B'],
        ['google/gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite'],
        ['openai/gpt-6-sol', 'GPT 6 Sol'],
        ['openai/gpt-6-luna', 'GPT 6 Luna']
      ]
    }]
  },{
    type: 'TRANSLATION',
    displayName: 'OpenRouter (Qwen 3.8 27B Free)',
    arguments: {
      model: 'qwen/qwen3.8-27b:free'
    }
  },{
    type: 'TRANSLATION',
    displayName: 'OpenRouter (Gemini 2.5 Flash Lite)',
    arguments: {
      model: 'google/gemini-2.5-flash-lite'
    }
  }]
};