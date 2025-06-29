import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'ocr-space',
  connector: 'ocr-space',
  displayName: 'OCR.space',
  description: 'Free OCR service provided by OCR.space',
  parameters: [{
    type: 'string',
    id: 'language',
    displayName: 'Content Language',
    required: true,
    options: [
      ['ara', 'Arabic'],
      ['bul', 'Bulgarian'],
      ['chs', 'Chinese (Simplified)'],
      ['cht', 'Chinese (Traditional)'],
      ['hrv', 'Croatian'],
      ['cze', 'Czech'],
      ['dan', 'Danish'],
      ['dut', 'Dutch'],
      ['eng', 'English'],
      ['fin', 'Finnish'],
      ['fre', 'French'],
      ['ger', 'German'],
      ['gre', 'Greek'],
      ['hun', 'Hungarian'],
      ['kor', 'Korean'],
      ['ita', 'Italian'],
      ['jpn', 'Japanese'],
      ['pol', 'Polish'],
      ['por', 'Portuguese'],
      ['rus', 'Russian'],
      ['slv', 'Slovenian'],
      ['spa', 'Spanish'],
      ['swe', 'Swedish'],
      ['tha', 'Thai'],
      ['tur', 'Turkish'],
      ['ukr', 'Ukrainian'],
      ['vnm', 'Vietnamese']
    ]
  }, {
    type: 'switch',
    id: 'merge-lines',
    displayName: 'Merge Words',
    hint: 'Create one annotation per detected text line instead of separate annotations for each word.'
  }]
};