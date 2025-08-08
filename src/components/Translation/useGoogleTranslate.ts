import { useCallback } from 'react';
import { TranslationResult } from './TranslationResult';

const key = 'my-api-key';

export const useGoogleTranslate = () => {

  const translate = useCallback((text: string): Promise<TranslationResult> =>
    fetch(`https://translation.googleapis.com/language/translate/v2/?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        q: text,
        target: 'en',
        format: 'text'
      })
    }).then(res => res.json()).then(response => {
      if (!Array.isArray(response.data?.translations)) {
        console.error(response);
        throw new Error('Unexpected response from Google Translate');
      }

      const { translatedText, detectedSourceLanguage } = response.data.translations[0];
      return { text: translatedText, language: detectedSourceLanguage };
    })
  , []);

  return translate;

}