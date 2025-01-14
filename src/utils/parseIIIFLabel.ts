import type { LanguageString } from '@allmaps/iiif-parser';

// Modified from Recogito Studio (AGPL) https://github.com/recogito/recogito-client/
export const parseIIIFLabel = (dict?: LanguageString) => {
  if (!dict) return;

  const en = dict['en'];
  if (en) {
    return en[0];
  } else {
    // Fallback #2
    const values = Object.values(dict).reduce<string[]>((flattened, value) => {
      return Array.isArray(value) ? [...flattened, ...value] : [...flattened, value]
    }, []);

    return values.length > 0 ? values[0] : undefined;
  }

}