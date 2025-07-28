import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'huggingface',
  connector: 'huggingface',
  displayName: 'HuggingFace',
  description: 'Transcribe with your own HuggingFace models',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'credential',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  },{
    type: 'string',
    id: 'model',
    displayName: 'Model',
    required: true,
    persist: true,
    options: [
      ['Qwen/Qwen2.5-VL-7B-Instruct', 'Qwen2.5-VL 7B'],
      ['meta-llama/Llama-4-Maverick-17B-128E-Instruct', 'Meta Llama 4 Maverick 17B'],
      ['google/gemma-3-27b-it', 'Gemma 3 27B']
    ]
  }]
};