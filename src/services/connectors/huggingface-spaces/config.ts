import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'huggingface-spaces',
  connector: 'huggingface-spaces',
  displayName: 'HuggingFace Spaces',
  description: 'Use your own model on HuggingFace Spaces',
  requiresRegion: true,
  parameters: [{
    type: 'string',
    id: 'endpoint',
    displayName: 'Endpoint',
    persist: true,
    required: true
  },{
    type: 'credential',
    id: 'access-token',
    displayName: 'Access Token (Optional)'
  },{
    type: 'string',
    id: 'image_fieldname',
    displayName: 'API Fieldname: Image',
    default: 'image',
    persist: true,
  },{
    type: 'string',
    id: 'prompt_fieldname',
    displayName: 'API Fieldname: Prompt',
    default: 'text',
    persist: true
  },{
    type: 'string',
    id: 'optional_args',
    displayName: 'Additional Arguments (JSON, Optional)',
    multiLine: true,
    persist: true
  }]
};