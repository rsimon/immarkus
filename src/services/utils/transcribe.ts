import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { buildTranscribeAndTagPrompt, PROMPT_TRANSCRIBE } from './prompts';
import { fileToBase64, parseOpenAIResponse, urlToBase64 } from './shared';
import type { 
  AnnotationServiceCrosswalkResponse, 
  AnnotationServiceResponse, 
  EntityReference, 
  EntityTagAnnotationBody, 
  Generator, 
  PageTransform, 
  Region,
  ServiceRequestArgs,
  TranscriptionAnnotationBody
} from '../Types';

export const getTranscriptionPrompt = (tags: EntityType[] = []): string =>
  tags.length === 0 ? PROMPT_TRANSCRIBE : buildTranscribeAndTagPrompt(tags);

export const transcribeOpenAICompatible = (
  image: File | string, 
  apiKey: string,
  baseURL: string,
  model: string,
  generator: Generator,
  args: ServiceRequestArgs = {},
  defaultHeaders?: any
): Promise<AnnotationServiceResponse> => {
  const client = new OpenAI({ 
    apiKey, 
    baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders
  });

  const prompt = args.customPrompt ?? getTranscriptionPrompt(args.tags);

  const submit = (imageUrl: string) => {   
    return client.chat.completions.create({
      model,
      max_completion_tokens: 12000,
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: prompt
        },{
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        }]
      }]
    }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}

const parseMention = (
  mention: { quote: string, context: string }, 
  transcription: string
): EntityReference => {
  if (!mention)
    throw new Error('Could not parse response: empty mention');

  const { quote, context } = mention;

  if (!context.includes(quote)) {
    console.warn(mention);
    console.warn(`Could not parse response - invalid mention: context does not include quote`);
    return;
  }

  if (!transcription.includes(context)) {
    console.warn(transcription);
    console.warn(`Could not parse response: transcription does not include mention`);
    return;
  }

  const hasMatchingContext = () => {
    let contextFrom = 0;

    const contextualOccurrences = new Set<number>();
    
    while (true) {
      // Outer loop: next occurrence of context in transcription
      const contextStart = transcription.indexOf(context, contextFrom);
      if (contextStart === -1)
        break;

      let quoteFrom = 0;

      while (true) {
        // Inner loop: next occurrence of quote in context
        const quoteOffset = context.indexOf(quote, quoteFrom);
        if (quoteOffset === -1)
          break;

        contextualOccurrences.add(contextStart + quoteOffset);
        quoteFrom = quoteOffset + 1;
      }

      contextFrom = contextStart + 1;
    }

    if (contextualOccurrences.size !== 1) {
      console.warn(`Could not uniquely locate mention: "${quote}"`);
      return false;
    }

    return true;
  }

 
  if (!hasMatchingContext()) return;
    
  const start = transcription.indexOf(quote, transcription.indexOf(context));
  const end = start + quote.length;
  return { start, end, quote };
}

export const crosswalkSimpleTranscriptionPayload = (
  annotationId: string, 
  result: any
): AnnotationBody[] => ([{
    id: uuidv4(),
    annotation: annotationId,
    purpose: 'transcribing',
    value: [{
      content: result.text
    }]
  } as TranscriptionAnnotationBody, 
  ...(result.entities || []).map(entity => ({
    id: uuidv4(),
    annotation: annotationId,
    type: 'Dataset',
    purpose: 'classifying',
    source: entity.class,
    properties: entity.properties,
    references: entity.mentions.map(m => parseMention(m, result.text)).filter(Boolean)
  } as EntityTagAnnotationBody))]);

export const parseSimpleOpenAICompatibleTranscriptionResponse = (
  data: any, 
  _: PageTransform, 
  region: Region
): AnnotationServiceCrosswalkResponse => {
  try {
    const result = parseOpenAIResponse(data);
    
    if (!result?.text)
      throw new Error('Could not parse response');

    const id = uuidv4();

    const annotations = [{
      id,
      bodies: crosswalkSimpleTranscriptionPayload(id, result),
      target: {
        annotation: id,
        selector: {
          type: ShapeType.RECTANGLE,
          geometry: {
            bounds: {
              minX: region.x,
              minY: region.y,
              maxX: region.x + region.w,
              maxY: region.y + region.h
            },
            ...region
          }
        }
      }
    }];

    return { annotations };
  } catch (error) {
    console.error(data);
    console.error(error);
    throw error;
  }
}

export const MOCK_RESPONSE = {
  "id": "gen-1795080588-NmUvAyZHUdsJJHCWXyNN",
  "object": "chat.completion",
  "created": 1795080588,
  "model": "google/gemini-3.7-flash",
  "provider": "Google",
  "system_fingerprint": null,
  "service_tier": "default",
  "choices": [
    {
      "index": 0,
      "logprobs": null,
      "finish_reason": "stop",
      "native_finish_reason": "STOP",
      "message": {
        "role": "assistant",
        "content": "```json\n{\n  \"text\": \"武勝門鳳凰山之\\n東起由忠孝門而\\n南轉至中和門之\\n東止皆係傍山為\\n城原止修外皮其\\n城內山石蟠固坡\\n土平漫未建內皮\\n歷未修有女墻內\\n惟山勢窄狹之處\\n舊有內皮現在瞰\\n裂應加修葺\",\n  \"entities\": [\n    {\n      \"class\": \"place\",\n      \"properties\": {\n        \"Translated\": \"Wusheng Gate\"\n      },\n      \"mentions\": [\n        {\n          \"quote\": \"武勝門\",\n          \"context\": \"武勝門鳳凰山之\"\n        }\n      ]\n    },\n    {\n      \"class\": \"place\",\n      \"properties\": {\n        \"Translated\": \"Mount Fenghuang\"\n      },\n      \"mentions\": [\n        {\n          \"quote\": \"鳳凰山\",\n          \"context\": \"武勝門鳳凰山之\\n東起\"\n        }\n      ]\n    },\n    {\n      \"class\": \"place\",\n      \"properties\": {\n        \"Translated\": \"Zhongxiao Gate\"\n      },\n      \"mentions\": [\n        {\n          \"quote\": \"忠孝門\",\n          \"context\": \"東起由忠孝門而\\n南轉\"\n        }\n      ]\n    },\n    {\n      \"class\": \"place\",\n      \"properties\": {\n        \"Translated\": \"Zhonghe Gate\"\n      },\n      \"mentions\": [\n        {\n          \"quote\": \"中和門\",\n          \"context\": \"南轉至中和門之\\n東止\"\n        }\n      ]\n    }\n  ]\n}\n```",
        "refusal": null,
        "reasoning": "**Examining Textual Data**\n\nMy current focus is on transcribing and understanding the provided Mandarin text. I'm identifying key phrases and characters to build a foundational comprehension of its content, aiming to decode its meaning and context.\n\n**Clarifying Character Meanings**\n\nI'm scrutinizing the character in line 10, attempting to definitively identify it. The context suggests it relates to damage or a gap that requires repair, particularly before the character 裂 in line 11.\n\n**Identifying Characters**\n\nI'm intensely analyzing the character on line 10. My hypothesis is it's 瞰 (kàn), formed from 目 and 敢, possibly describing a fractured or split state preceding 裂. I'm exploring related terms like 皸裂 and 崩裂.\n\n**Identifying Wuchang City Walls**\n\nI've realized the text pertains to the Wuchang city walls, referencing specific gates and mountains like 武勝門 and 鳳凰山. I'm now cross-referencing these terms with historical documents, particularly those concerning repairs to the Wuchang fortifications.\n\n",
        "reasoning_details": [
          {
            "type": "reasoning.text",
            "text": "**Examining Textual Data**\n\nMy current focus is on transcribing and understanding the provided Mandarin text. I'm identifying key phrases and characters to build a foundational comprehension of its content, aiming to decode its meaning and context.\n\n**Clarifying Character Meanings**\n\nI'm scrutinizing the character in line 10, attempting to definitively identify it. The context suggests it relates to damage or a gap that requires repair, particularly before the character 裂 in line 11.\n\n**Identifying Characters**\n\nI'm intensely analyzing the character on line 10. My hypothesis is it's 瞰 (kàn), formed from 目 and 敢, possibly describing a fractured or split state preceding 裂. I'm exploring related terms like 皸裂 and 崩裂.\n\n**Identifying Wuchang City Walls**\n\nI've realized the text pertains to the Wuchang city walls, referencing specific gates and mountains like 武勝門 and 鳳凰山. I'm now cross-referencing these terms with historical documents, particularly those concerning repairs to the Wuchang fortifications.\n\n",
            "format": "google-gemini-v1",
            "index": 0
          },
          {
            "type": "reasoning.encrypted",
            "data": "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.eyJlbmRwb2ludF9zbHVnIjoiZ29vZ2xlL2dlbWluaS0zLjctZmxhc2gtMjAyNjA4MTN8Z29vZ2xlLXZlcnRleC9nbG9iYWwifQ",
            "format": "google-gemini-v1",
            "index": 1
          }
        ]
      }
    }
  ],
  "usage": {
    "prompt_tokens": 1776,
    "completion_tokens": 1870,
    "total_tokens": 3646,
    "cost": 0.0083445,
    "is_byok": false,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "cache_write_tokens": 0,
      "audio_tokens": 0,
      "video_tokens": 0
    },
    "cost_details": {
      "upstream_inference_cost": 0.0083445,
      "upstream_inference_prompt_cost": 0.001332,
      "upstream_inference_completions_cost": 0.0070125
    },
    "completion_tokens_details": {
      "reasoning_tokens": 1443,
      "image_tokens": 0,
      "audio_tokens": 0
    }
  }
}