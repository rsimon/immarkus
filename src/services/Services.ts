import { ServiceConfig } from './Types';
import { config as AnthropicClaude } from './connectors/anthropic-claude/config';
import { config as AzureCV } from './connectors/azure-cv/config';
import { config as GoogleGemini } from './connectors/google-gemini/config';
import { config as GoogleVision } from './connectors/google-vision/config';
import { config as HuggingFaceInference } from './connectors/huggingface-inference/config';
// import { config as HuggingFaceSpaces } from './connectors/huggingface-spaces/config';
import { config as OCRSpace } from './connectors/ocr-space/config';
import { config as OpenAI } from './connectors/openai/config';
import { config as SinoNomAPI } from './connectors/sino-nom/config';
import { config as VolcanoEngine } from './connectors/volcano-engine/config';

export const Services: ServiceConfig[] = [
  AnthropicClaude,
  AzureCV,
  GoogleGemini, 
  GoogleVision,
  HuggingFaceInference,
  // HuggingFaceSpaces,
  OCRSpace,
  OpenAI,
  SinoNomAPI,
  VolcanoEngine
]