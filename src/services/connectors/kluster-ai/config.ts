import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'kluster-ai',
  connector: 'kluster-ai',
  displayName: 'kluster.ai',
  description: 'Text transcription via kluster.ai multimodal models',
  requiresKey: true,
  requiresRegion: true,
  parameters: [{
    type: 'string',
    id: 'model',
    displayName: 'Model',
    required: true,
    persist: true,
    options: [
      ['meta-llama/Llama-4-Scout-17B-16E-Instruct', 'Meta Llama 4 Scout'],
      ['meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', 'Meta Llama 4 Maverick'],
      ['google/gemma-3-27b-it', 'Gemma 3 27B'],
      ['Qwen/Qwen2.5-VL-7B-Instruct', 'Qwen2.5-VL 7B']
    ]
  },{
    type: 'api_key',
    id: 'api-key',
    displayName: 'Your kluster.ai API Key',
    required: true
  }]
};