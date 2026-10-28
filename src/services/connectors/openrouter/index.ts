import { ServiceConnector } from '@/services/Types';
import { transcribe } from './transcribe';
import { translate } from './translate';
import { annotate } from './annotate';
import { 
  parseAnnotationResponse,
  parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse 
} from '@/services/utils';

export default { annotate, transcribe, translate, parseTranscriptionResponse, parseAnnotationResponse } as ServiceConnector;