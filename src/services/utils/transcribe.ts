import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { buildTranscribeAndTagPrompt, PROMPT_TRANSCRIBE } from './prompts';
import { fileToBase64, parseOpenAIResponse, urlToBase64 } from './shared';
import type { 
  AnnotationServiceCrosswalkResponse, 
  AnnotationServiceResponse, 
  Generator, 
  PageTransform, 
  Region,
  ServiceRequestArgs
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
    /*
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
    */

    return Promise.resolve({ generator, data: undefined });
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}

const parseMention = (mention: { quote: string, context: string }, transcription: string) => {
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

export const parseTranscriptionResponseBodies = (annotationId: string, result: any): AnnotationBody[] => ([{
  id: uuidv4(),
  annotation: annotationId,
  purpose: 'commenting',
  value: result.text
}, ...(result.entities || []).map(entity => ({
  id: uuidv4(),
  annotation: annotationId,
  type: 'Dataset',
  purpose: 'classifying',
  source: entity.class,
  properties: entity.properties,
  references: entity.mentions.map(m => parseMention(m, result.text)).filter(Boolean)
}))]);

export const parseOpenAICompatibleTranscriptionResponse = (data: any, _: PageTransform, region: Region): AnnotationServiceCrosswalkResponse => {
  try {
    const result = MOCK_RESULT; // parseOpenAIResponse(data);
    
    if (!result?.text)
      throw new Error('Could not parse response');

    const id = uuidv4();

    const annotations = [{
      id,
      bodies: parseTranscriptionResponseBodies(id, result),
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

    console.log(annotations);

    return { annotations };
  } catch (error) {
    console.error(data);
    console.error(error);
    throw error;
  }
}

const MOCK_RESULT = {
    "text": "宣府分守口北道轄不屬路\n本城土築於洪武二十七年甎包於正統五年隆慶二年加\n修周二十四里高三丈五尺東至鷄鳴驛六十里西至萬全\n左衞城六十里南至深井堡六十里北至葛峪堡四十里故\n元宣德府\n聖祖開基之初因改名宣府始設宣府左右前三衞續移興和一\n所先徑隸後府宣德五年始建萬全都司併各路衞所統攝\n之撫鎮部道暨副遊管糧理刑同知各衞所儒學等官同城\n總計各營衞見在官軍二萬三百四十八員名馬騾駝一萬\n三千三百一十八匹頭隻本城據鎮上㳺稱都會之地重兵\n屯聚頗足殫壓惟是款後守貢講事之夷絡繹不絶谿欲無\n厭徃徃詭計希加添於額賞之外且蟻聚蝘附時有潜住鎮\n城者殊爲將來隱憂近已裁其名數節其徃来額賞外毫不\n増加各酋乆矣帖服矣乃防範撙節之道所當慎終如始云",
    "entities": [
        {
            "class": "place",
            "properties": {
                "Translated": "Xuanfu"
            },
            "mentions": [
                {
                    "quote": "宣府",
                    "context": "宣府分守口北道"
                },
                {
                    "quote": "宣府",
                    "context": "因改名宣府始設"
                },
                {
                    "quote": "宣府",
                    "context": "始設宣府左右前"
                }
            ]
        },
        {
            "class": "place",
            "properties": {
                "Translated": "Koubei Dao (Koubei Circuit)"
            },
            "mentions": [
                {
                    "quote": "口北道",
                    "context": "分守口北道轄不"
                }
            ]
        },
        {
            "class": "place",
            "properties": {
                "Translated": "This city (Xuanfu)"
            },
            "mentions": [
                {
                    "quote": "本城",
                    "context": "本城土築於洪武"
                },
                {
                    "quote": "本城",
                    "context": "匹頭隻本城據鎮"
                }
            ]
        },
        {
            "class": "place",
            "properties": {
                "Translated": "Jiming Post Station"
            },
            "mentions": [
                {
                    "quote": "鷄鳴驛",
                    "context": "東至鷄鳴驛六十"
                }
            ]
        },
        {
            "class": "place",
            "properties": {
                "Translated": "Wanquan Zuowei City"
            },
            "mentions": [
                {
                    "quote": "萬全左衞城",
                    "context": "西至萬全左衞城六十里"
                }
            ]
        },
        {
            "class": "place",
            "properties": {
                "Translated": "Shenjing Fort"
            },
            "mentions": [
                {
                    "quote": "深井堡",
                    "context": "南至深井堡六十"
                }
            ]
        },
        {
            "class": "place",
            "properties": {
                "Translated": "Geyu Fort"
            },
            "mentions": [
                {
                    "quote": "葛峪堡",
                    "context": "北至葛峪堡四十"
                }
            ]
        },
        {
            "class": "place",
            "properties": {
                "Translated": "Xinghe"
            },
            "mentions": [
                {
                    "quote": "興和",
                    "context": "續移興和一所先"
                }
            ]
        },
        {
            "class": "place",
            "properties": {
                "Translated": "Wanquan All-Commandery"
            },
            "mentions": [
                {
                    "quote": "萬全都司",
                    "context": "始建萬全都司併"
                }
            ]
        },
        {
            "class": "person",
            "properties": {
                "Translated": "Sainted Ancestor (founding emperor)"
            },
            "mentions": [
                {
                    "quote": "聖祖",
                    "context": "聖祖開基之初因"
                }
            ]
        }
    ]
};