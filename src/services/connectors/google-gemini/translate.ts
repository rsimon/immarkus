import { TranslationServiceResponse } from '@/services/Types';
import { getLanguageName } from '@/services/utils';
import { GoogleGenAI, Type } from '@google/genai';

interface GeminiCandidate {

  detectedLanguage: string;

  translatedText: string;

}

const parseTranslationResponse = (data: any) =>
  (data.candidates as any[]).reduce<GeminiCandidate[]>((all, data) => {
    return [...all, ...data.content.parts.map((part: any) =>
      JSON.parse(part.text))];
  }, []);

export const translate = (text: string, lang?: string, options?: Record<string, any>): Promise<TranslationServiceResponse>  => {
  const apiKey = options['api-key'];

  const generator = {
    id: 'gemini-2.0-flash',
    name: 'Google Gemini (gemini-2.0-flash)',
    homepage: 'https://gemini.google.com/app'
  };

  const language = getLanguageName(lang || 'en');

  const ai = new GoogleGenAI({ apiKey });

  // More detailed prompt for better language detection
  const prompt = `You are a professional translator. Please:

1. Detect the source language of the given text
2. Translate it accurately to ${language}

Text: 

${text}`;

  return ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: { 
            detectedLanguage: { 
              type: Type.STRING,
              description: "ISO code of detected language"
            },
            translatedText: { 
              type: Type.STRING,
              description: "The translated text in target language"
            }
          },
          required: ['detectedLanguage', 'translatedText']
        }
      }
    }).then(data => { 
      const parsed = parseTranslationResponse(data);
      if (parsed.length < 1) {
        console.error(data);
        throw new Error('Unexpected Google Gemini response');
      }

      const { detectedLanguage, translatedText } = parsed[0];
      return { generator, translation: translatedText, language: detectedLanguage } as TranslationServiceResponse;
    });
  }