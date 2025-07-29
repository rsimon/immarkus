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
  }]
};