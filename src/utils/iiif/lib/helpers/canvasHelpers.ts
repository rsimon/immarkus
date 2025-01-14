import { Canvas, InternationalString } from '@iiif/presentation-3';

export const getCanvasLabel = (canvas: Canvas, preferredLanguage?: string): string | undefined => {
  if (!canvas.label) return undefined;

  if (typeof canvas.label === 'string')
    return canvas.label;

  // Handle IIIF 2.x style "@value" format, just in case
  if (Array.isArray(canvas.label) && canvas.label[0] && '@value' in canvas.label[0])
    return canvas.label[0]['@value'];

  // Standard IIIF 3.0 InternationalString
  const label = canvas.label as InternationalString;
  
  // 1. Preferred language, if available
  if (preferredLanguage && 
      label[preferredLanguage] && 
      Array.isArray(label[preferredLanguage]) && 
      label[preferredLanguage].length > 0) {
    return label[preferredLanguage][0];
  }

  // 2. English if available
  if (label['en'] && 
      Array.isArray(label['en']) && 
      label['en'].length > 0) {
    return label['en'][0];
  }

  // 3. First available language value as last resort
  const languages = Object.keys(label);
  if (languages.length > 0) {
    const firstLang = languages[0];
    if (Array.isArray(label[firstLang]) && label[firstLang].length > 0) {
      return label[firstLang][0];
    }
  }
}