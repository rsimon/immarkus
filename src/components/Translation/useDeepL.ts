import { useCallback } from 'react';
import type { TranslationResult } from './TranslationResult';

export const DEFAULT_ENDPOINT = '/translate';

export interface DeepLResponse {

  translations: DeepLTranslation[];

}

export interface DeepLTranslation {

  detected_source_language: string;

  text: string;

}

export const useDeepL = (key: string, endpoint: string = DEFAULT_ENDPOINT) => {

  return useCallback((text: string): Promise<TranslationResult> => 
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `DeepL-Auth-Key ${key}` 
      },
      body: JSON.stringify({
        text: [text], target_lang: 'EN'
      })
    })
      .then(res => res.json())
      .then((response: DeepLResponse) => {
        if ((response.translations || []).length < 1) {
          console.error(response);
          throw new Error('Unexpected DeepL translation response');
        } else {
          const first = response.translations[0];
          return { text: first.text, language: first.detected_source_language };
        }
      })
  , [key, endpoint])

}