import { ServiceConfig } from './Types';
import { config as AzureCV } from './connectors/azure-cv/config';
import { config as GoogleGemini } from './connectors/google-gemini/config';
import { config as GoogleVision } from './connectors/google-vision/config';
import { config as KlusterAI } from './connectors/kluster-ai/config';
import { config as OCRSpace } from './connectors/ocr-space/config';
import { config as OpenAI } from './connectors/openai/config';

export const Services: ServiceConfig[] = [
  OCRSpace,
  GoogleVision,
  GoogleGemini,
  OpenAI,
  AzureCV,
  KlusterAI
]