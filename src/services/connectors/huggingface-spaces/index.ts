import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';
import { PromptServiceType, ServiceConnector, ServiceRequestArgs } from '@/services/Types';

const getPrompt = (type: PromptServiceType, _args: ServiceRequestArgs): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt() : undefined;

export default { transcribe, getPrompt, parseTranscriptionResponse } as ServiceConnector;