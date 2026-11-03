import { PromptServiceType, ServiceConnector, ServiceRequestArgs } from '@/services/Types';
import { transcribe } from './transcribe';
import { translate } from './translate';
import { 
  getTranscriptionPrompt, 
  parseOpenAICompatibleTranscriptionResponse as parseTranscriptionResponse 
} from '@/services/utils'; 

const getPrompt = (type: PromptServiceType, args: ServiceRequestArgs): string | undefined =>
  type === 'TRANSCRIPTION' ? getTranscriptionPrompt(args.tags) : undefined;

export default { transcribe, getPrompt, translate, parseTranscriptionResponse } as ServiceConnector;