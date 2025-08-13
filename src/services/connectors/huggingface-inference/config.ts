import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'huggingface-inference',
  connector: 'huggingface-inference',
  displayName: 'HuggingFace Inference',
  requiresKey: true,
  keyInstructions: `
You need an Access Token to use HuggingFace Inference Providers.

To get your own key:
- [Start here](https://huggingface.co/) to create a HuggingFace account
- After you are logged in, click your Avatar in the top-left corner to **open your account menu**
- Choose **Settings**
- In the sidebar, choose **Access Tokens**
- Click **Create new token**
- Give the new token a name of your choice (e.g. "IMMARKUS")
- Under **User Permissions**, check **Make calls to Inference Providers**
- Click **Create Token**
`.trim(),
  parameters: [{
    type: 'credential',
    id: 'access-token',
    displayName: 'HuggingFace Access Token',
    required: true
  }],
  services: [{
    type: 'TRANSCRIPTION',
    requiresRegion: true,
    description: 'Transcription via HuggingFace\'s Inference Providers',
    parameters: [{
      type: 'string',
      id: 'model',
      displayName: 'Model',
      required: true,
      persist: true,
      options: [
        ['Qwen/Qwen2.5-VL-7B-Instruct', 'Qwen2.5-VL-7B-Instruct'],
        ['Qwen/Qwen2.5-VL-32B-Instruct', 'Qwen2.5-VL-32B-Instruct'],
        ['meta-llama/Llama-4-Maverick-17B-128E-Instruct', 'Meta Llama-4-Maverick-17B-128E-Instruct'],
        ['google/gemma-3-27b-it', 'Gemma-3-27b-it']
      ]
    }]
  },{
    type: 'TRANSLATION',
    displayName: 'HuggingFace (Qwen 7B)',
    arguments: {
      model: 'Qwen/Qwen2.5-VL-7B-Instruct'
    }
  },{
    type: 'TRANSLATION',
    displayName: 'HuggingFace (Qwen 32B)',
    arguments: {
      model: 'Qwen/Qwen2.5-VL-32B-Instruct'
    }
  },{
    type: 'TRANSLATION',
    displayName: 'HuggingFace (Llama Maverick)',
    arguments: {
      model: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct'
    }
  },{
    type: 'TRANSLATION',
    displayName: 'HuggingFace (Google Gemma)',
    arguments: {
      model: 'google/gemma-3-27b-it'
    }
  }]
};