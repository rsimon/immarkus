import { ServiceConnector } from '@/services/Types';
import { transcribe } from './transcribe';
import { parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse } from '@/services/utils';

export default { transcribe, parseTranscriptionResponse } as ServiceConnector;