import OpenAI from 'openai';
import type { Generator, TranslationServiceResponse } from '../Types';
import { parseOpenAIResponse } from './shared';

const label = new Intl.DisplayNames(['en'], { type: 'language' });

export const getLanguageName = (iso: string) => label.of(iso);

export const translateOpenAICompatible = (
  text: string,
  apiKey: string,
  baseURL: string,
  model: string,
  generator: Generator,
  language?: string,
  defaultHeaders?: any
): Promise<TranslationServiceResponse> => {
  const client = new OpenAI({ 
    apiKey, 
    baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders
  });

  const lang = language ? getLanguageName(language) : 'English';

  return client.chat.completions.create({
      model,
      max_completion_tokens: 4000,
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: `Guess the language of this text and translate it text to ${lang}. Your response must be ONLY valid JSON in this format: { "translation": "all translated text goes here", "language": "the guessed language, as ISO code" }`
        },{
          type: 'text',
          text
        }]
      }]
    }).then((data: any) => { 
      const result = parseOpenAIResponse(data);
      if (!result) throw new Error('OpenAI response parse error');
      const { translation, language } = result;
      return { generator, translation, language } as TranslationServiceResponse;
    });
}