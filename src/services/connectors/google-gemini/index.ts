import { transcribe } from './transcribe';
import { translate } from './translate';
import { parseResponse as parseTranscriptionResponse} from './parseResponse';
import { PromptServiceType, ServiceConnector, ServiceRequestArgs } from '@/services/Types';

const getPrompt = (_type: PromptServiceType, _args: ServiceRequestArgs): undefined => undefined;

export default { transcribe, getPrompt, translate, parseTranscriptionResponse } as ServiceConnector;