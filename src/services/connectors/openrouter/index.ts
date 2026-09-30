import { ServiceConnector } from '@/services/Types';
import { transcribe } from './transcribe';
import { translate } from './translate';
import { annotate, parseAnnotationResponse } from './annotate';
import { parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse } from '@/services/utils';

export default { annotate, transcribe, translate, parseTranscriptionResponse, parseAnnotationResponse } as ServiceConnector;