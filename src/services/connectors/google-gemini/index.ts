import { transcribe } from './transcribe';
import { translate } from './translate';
import { parseResponse as parseTranscriptionResponse} from './parseResponse';
import { ServiceConnector } from '@/services/Types';

export default { transcribe, translate, parseTranscriptionResponse } as ServiceConnector;