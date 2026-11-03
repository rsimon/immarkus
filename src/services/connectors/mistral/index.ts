import { PromptServiceType, ServiceConnector, ServiceRequestArgs } from '@/services/Types';
import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { annotate, getPrompt as getAnnotationPrompt, parseAnnotationResponse } from './annotate';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';

const getPrompt = (type: PromptServiceType, args: ServiceRequestArgs): string | undefined =>
  type === 'ANNOTATION' ? getAnnotationPrompt(args.tags, args.relations, args.width ?? 0, args.height ?? 0) :
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt(args.options, args.tags) : undefined;

export default { annotate, getPrompt, parseAnnotationResponse, transcribe, parseTranscriptionResponse } as ServiceConnector;