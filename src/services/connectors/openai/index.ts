import { transcribe } from './transcribe';
import { translate } from './translate';
import { parseResponse as parseTranscriptionResponse } from './parseResponse';
import { PromptServiceType, ServiceConnector, ServiceRequestArgs } from '@/services/Types';
import { getTranscriptionPrompt } from '@/services/utils';

const getPrompt = (type: PromptServiceType, _args: ServiceRequestArgs): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt() : undefined;

export default { transcribe, getPrompt, translate, parseTranscriptionResponse } as ServiceConnector;