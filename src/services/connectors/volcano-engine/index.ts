import { ServiceConnector } from '@/services/Types';
import { transcribe } from './transcribe';
import { translate } from './translate';
import { parseOpenAICompatibleTranscriptionResponse as parseServiceResponse } from '@/services/utils'; 

export default { transcribe, translate, parseServiceResponse } as ServiceConnector;