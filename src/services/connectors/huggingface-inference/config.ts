import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'huggingface-inference',
  connector: 'huggingface-inference',
  displayName: 'HuggingFace Inference',
  description: 'Transcription via HuggingFace\'s Inference Providers',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'credential',
    id: 'access-token',
    displayName: 'HuggingFace Access Token',
    required: true
  },{
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
  }],
    keyInstructions: `
You need an Access Token to use HuggingFace Inference Providers.

To get your own key:
- [Start here](https://huggingface.co/) to create a HuggingFace account
- After you are logged in **open your account menu** by clicking on your Avatar in the top-left corner
- Choose **Settings**
- In the sidebar, choose **Access Tokens**
- Click **Create new token**
- Give the token a name of your choice
- Under **User Permissions** check "Make calls to Inference Providers"
- Click **Create Token**
`.trim()
};