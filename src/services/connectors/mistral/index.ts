import { ServiceConnector } from '@/services/Types';
import { transcribe } from './transcribe';
import { annotate, parseAnnotationResponse } from './annotate';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';

export default { annotate, parseAnnotationResponse, transcribe, parseTranscriptionResponse } as ServiceConnector;