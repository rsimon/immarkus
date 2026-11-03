import { ServiceConnector, ServiceRequestArgs, ServiceType } from '@/services/Types';
import { getPrompt as getTranscriptionPrompt, transcribe } from './transcribe';
import { translate } from './translate';
import { parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse } from '@/services/utils';

const getPrompt = (type: ServiceType, args: ServiceRequestArgs): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt(args.tags) : undefined;

export default { transcribe, getPrompt, translate, parseTranscriptionResponse } as ServiceConnector;