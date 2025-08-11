import { ServiceConnectorConfig } from '@/services/Types';

export const config: ServiceConnectorConfig = {
  id: 'sino-nom',
  connector: 'sino-nom',
  displayName: 'Kim Sino Nom',
  requiresKey: true,
  services: [{
    type: 'TRANSCRIPTION',
    description: 'Sino-Nom OCR by the Kim Hán Nôm project',
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
  }]
};