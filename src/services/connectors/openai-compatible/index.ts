import { ServiceConnector, ServicePromptContext, ServiceType } from '@/services/Types';
import { transcribe } from './transcribe';
import { getPrompt as getAnnotationPrompt, annotate } from './annotate';
import { getPrompt as getTranscriptionPrompt } from '@/services/utils/transcribe';
import { 
  parseAnnotationResponse,
  parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse 
} from '@/services/utils';

const getPrompt = (type: ServiceType, context: ServicePromptContext): string | undefined =>
  type === 'ANNOTATION'
    ? getAnnotationPrompt(context.tags, context.relations)
    : type === 'TRANSCRIPTION'
      ? getTranscriptionPrompt(context.tags)
      : undefined;

export default { annotate, getPrompt, transcribe, parseTranscriptionResponse, parseAnnotationResponse } as ServiceConnector;