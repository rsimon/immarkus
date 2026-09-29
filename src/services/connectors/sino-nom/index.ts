import { transcribe } from './transcribe';
import { parseResponse as parseServiceResponse } from './parseResponse';
import { ServiceConnector } from '@/services/Types';

export default { transcribe, parseServiceResponse } as ServiceConnector;