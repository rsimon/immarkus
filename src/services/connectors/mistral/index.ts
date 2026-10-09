import { ServiceConnector } from '@/services/Types';
import { transcribe } from './transcribe';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';

export default { transcribe, parseTranscriptionResponse } as ServiceConnector;