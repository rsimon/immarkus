import { PROMPT_TRANSCRIBE, transcribe } from './transcribe';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';
import { PromptServiceType, ServiceConnector, ServiceRequestArgs } from '@/services/Types';

const getPrompt = (type: PromptServiceType, _args: ServiceRequestArgs): string | undefined =>
  type === 'TRANSCRIPTION' ? PROMPT_TRANSCRIBE : undefined;

export default { transcribe, getPrompt, parseTranscriptionResponse } as ServiceConnector;