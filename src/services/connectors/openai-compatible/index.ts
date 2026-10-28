import { ServiceConnector } from '@/services/Types';
import { transcribe } from './transcribe';
import { annotate } from './annotate';
import { 
  parseAnnotationResponse,
  parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse 
} from '@/services/utils';

export default { annotate, transcribe, parseTranscriptionResponse, parseAnnotationResponse } as ServiceConnector;