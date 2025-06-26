import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'tencent-ocr',
  connector: 'tencent-ocr',
  displayName: 'Tencent Cloud OCR',
  description: 'OCR via Tencent Cloud Optical Character Recognition',
  requiresKey: true,
  parameters: [{
    type: 'api_key',
    id: 'secret-id',
    displayName: 'Your Secret ID',
    required: true
  },{
    type: 'api_key',
    id: 'secret-key',
    displayName: 'Your Secret Key',
    required: true
  }]
};