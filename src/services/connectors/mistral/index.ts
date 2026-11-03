import { ServiceConnector, ServiceRequestArgs, ServiceType } from '@/services/Types';
import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { annotate, getPrompt as getAnnotationPrompt, parseAnnotationResponse } from './annotate';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';

const getPrompt = (type: ServiceType, args: ServiceRequestArgs): string | undefined =>
  type === 'ANNOTATION'
    ? getAnnotationPrompt(args.tags, args.relations)
    : type === 'TRANSCRIPTION'
      ? getTranscriptionPrompt(args.options, args.tags)
      : undefined;

export default { annotate, getPrompt, parseAnnotationResponse, transcribe, parseTranscriptionResponse } as ServiceConnector;