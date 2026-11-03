import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';
import { ServiceConnector, ServicePromptContext, ServiceType } from '@/services/Types';

const getPrompt = (type: ServiceType, _context: ServicePromptContext): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt() : undefined;

export default { transcribe, getPrompt, parseTranscriptionResponse } as ServiceConnector;