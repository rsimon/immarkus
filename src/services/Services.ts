import { ServiceConfig } from './Types';
import { config as GoogleVision } from './connectors/google-vision/config';
import { config as OCRSpace } from './connectors/ocr-space/config';
import { config as OpenAI } from './connectors/openai/config';

export const Services: ServiceConfig[] = [
  OCRSpace,
  GoogleVision,
  OpenAI
]