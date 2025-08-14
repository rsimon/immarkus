import { InferenceClient } from '@huggingface/inference';
import { getLanguageName, parseOpenAIResponse } from '@/services/utils';
import { TranslationServiceResponse } from '@/services/Types';

export const translate = (text: string, lang?: string, args?: Record<string, any>) => {
  const hfToken = args['access-token'];
  const model = args['model'];

  // Should never happen
  if (!hfToken || !model)
    throw new Error('Missing access configuration');

  const language = getLanguageName(lang || 'en');

  const generator = {
    id: model,
    name: `HuggingFace (${model})`,
    homepage: 'https://huggingface.co/docs/inference-providers'
  };

  const client = new InferenceClient(hfToken);

  return client.chatCompletion({
    model,
    messages: [
      {
        role: 'user',
        content: [{
          type: 'text',
          text: `Guess the language of this text and translate it text to ${language}. Your response must be ONLY valid JSON in this format: { "translation": "all translated text goes here", "language": "the guessed language, as ISO code" }`
        },{
          type: 'text',
          text
        }]
      },
    ],
  }).then((data: any) => {
      const result = parseOpenAIResponse(data);
      if (!result) throw new Error('OpenAI response parse error');
      const { translation, language } = result;
      return { generator, translation, language } as TranslationServiceResponse;
  });

}