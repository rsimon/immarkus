import { ServiceConnector, ServicePromptContext, ServiceType } from '@/services/Types';
import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { translate } from './translate';
import { parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse } from '@/services/utils';

const getPrompt = (type: ServiceType, context: ServicePromptContext): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt(context.tags) : undefined;

export default { transcribe, getPrompt, translate, parseTranscriptionResponse } as ServiceConnector;