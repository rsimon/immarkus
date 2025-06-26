import { ServiceConfig } from './Types';
import { config as GoogleGemini } from './connectors/google-gemini/config';
import { config as GoogleVision } from './connectors/google-vision/config';
import { config as OCRSpace } from './connectors/ocr-space/config';
import { config as OpenAI } from './connectors/openai/config';
import { config as TencentOCR } from './connectors/tencent-ocr/config';

export const Services: ServiceConfig[] = [
  OCRSpace,
  GoogleVision,
  GoogleGemini,
  OpenAI,
  TencentOCR
]