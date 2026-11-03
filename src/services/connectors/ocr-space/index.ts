import { transcribe } from './transcribe';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';
import { PromptServiceType, ServiceConnector, ServiceRequestArgs } from '@/services/Types';

const getPrompt = (_type: PromptServiceType, _args: ServiceRequestArgs): undefined => undefined;

export default { transcribe, getPrompt, parseTranscriptionResponse } as ServiceConnector;