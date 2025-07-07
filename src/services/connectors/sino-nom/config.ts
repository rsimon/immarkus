import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'sino-nom',
  connector: 'sino-nom',
  displayName: 'Kim Sino Nom',
  description: 'Sino-Nom OCR by the Kim Hán Nôm project',
  requiresKey: true,
  parameters: [{
    type: 'credential',
    id: 'email',
    displayName: 'Account E-Mail',
    required: true
  },{
    type: 'credential',
    id: 'password',
    displayName: 'Password',
    required: true
  }]
};