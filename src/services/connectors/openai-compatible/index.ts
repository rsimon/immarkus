import { PromptServiceType, ServiceConnector, ServiceRequestArgs } from '@/services/Types';
import { transcribe } from './transcribe';
import { getPrompt as getAnnotationPrompt, annotate } from './annotate';
import { 
  getTranscriptionPrompt,
  parseAnnotationResponse,
  parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse 
} from '@/services/utils';

const getPrompt = (type: PromptServiceType, args: ServiceRequestArgs): string | undefined =>
  type === 'ANNOTATION' ? getAnnotationPrompt(args.tags, args.relations, args.width ?? 0, args.height ?? 0) :
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt(args.tags) : undefined;

export default { annotate, getPrompt, transcribe, parseTranscriptionResponse, parseAnnotationResponse } as ServiceConnector;