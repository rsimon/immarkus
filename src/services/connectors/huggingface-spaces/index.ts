import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';
import { ServiceConnector, ServiceRequestArgs, ServiceType } from '@/services/Types';

const getPrompt = (type: ServiceType, _args: ServiceRequestArgs): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt() : undefined;

export default { transcribe, getPrompt, parseTranscriptionResponse } as ServiceConnector;