import { useCallback } from "react";
import { TranslationResult } from "./TranslationResult";

// TODO for dev/testing only!
// export const DEFAULT_ENDPOINT = 'http://localhost:5000/translate';
export const DEFAULT_ENDPOINT = '/translate';

export interface LibreTranslateResponse {

  detectedLanguage?: {

    confidence: number;

    language: string;

  }

  translatedText: string;

}

export const useLibreTranslate = (endpoint = DEFAULT_ENDPOINT) => {

  return useCallback((text: string): Promise<TranslationResult> =>
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        q: text,
        source: 'auto',
        target: 'en'
      })
    }).then(res => res.json()).then((response: LibreTranslateResponse) => {
      return { text: response.translatedText, language: response.detectedLanguage?.language };
    })
  , [endpoint]);
  
}