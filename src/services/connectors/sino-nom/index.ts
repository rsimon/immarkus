import { transcribe } from './transcribe';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';
import { ServiceConnector } from '@/services/Types';

export default { transcribe, parseTranscriptionResponse } as ServiceConnector;