import { ServiceConnector, ServicePromptContext, ServiceType } from '@/services/Types';
import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { annotate, getPrompt as getAnnotationPrompt, parseAnnotationResponse } from './annotate';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';

const getPrompt = (type: ServiceType, context: ServicePromptContext): string | undefined =>
  type === 'ANNOTATION'
    ? getAnnotationPrompt(context.tags, context.relations)
    : type === 'TRANSCRIPTION'
      ? getTranscriptionPrompt(context.options, context.tags)
      : undefined;

export default { annotate, getPrompt, parseAnnotationResponse, transcribe, parseTranscriptionResponse } as ServiceConnector;