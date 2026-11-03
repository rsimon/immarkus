import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { translate } from './translate';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';
import { ServiceConnector, ServiceRequestArgs, ServiceType } from '@/services/Types';

const getPrompt = (type: ServiceType, _args: ServiceRequestArgs): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt() : undefined;

export default { transcribe, getPrompt, translate, parseTranscriptionResponse } as ServiceConnector;