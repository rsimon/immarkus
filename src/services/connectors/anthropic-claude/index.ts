import { ServiceConnector, ServiceRequestArgs, ServiceType } from '@/services/Types';
import { transcribe } from './transcribe';
import { translate } from './translate';
import { getPrompt as getTranscriptionPrompt } from '@/services/utils/transcribe';
import { parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse } from '@/services/utils';

const getPrompt = (type: ServiceType, args: ServiceRequestArgs): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt(args.tags) : undefined;

export default { transcribe, getPrompt, translate, parseTranscriptionResponse } as ServiceConnector;