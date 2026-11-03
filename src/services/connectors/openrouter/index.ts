import { ServiceConnector, ServiceRequestArgs, ServiceType } from '@/services/Types';
import { transcribe } from './transcribe';
import { translate } from './translate';
import { getPrompt as getAnnotationPrompt, annotate } from './annotate';
import { getPrompt as getTranscriptionPrompt } from '@/services/utils/transcribe';
import { 
  parseAnnotationResponse,
  parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse 
} from '@/services/utils';

const getPrompt = (type: ServiceType, args: ServiceRequestArgs): string | undefined =>
  type === 'ANNOTATION'
    ? getAnnotationPrompt(args.tags, args.relations)
    : type === 'TRANSCRIPTION'
      ? getTranscriptionPrompt(args.tags)
      : undefined;

export default { annotate, getPrompt, transcribe, translate, parseTranscriptionResponse, parseAnnotationResponse } as ServiceConnector;