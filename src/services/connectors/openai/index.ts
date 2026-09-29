import { transcribe } from './transcribe';
import { translate } from './translate';
import { parseResponse as parseServiceResponse } from './parseResponse';
import { ServiceConnector } from '@/services/Types';

export default { transcribe, translate, parseServiceResponse } as ServiceConnector;