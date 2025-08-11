import { ServiceConnector } from '@/services/Types';
import { transcribe } from './transcribe';
import { translate } from './translate';
import { parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse } from '@/services/utils';

export default { transcribe, translate, parseTranscriptionResponse } as ServiceConnector;