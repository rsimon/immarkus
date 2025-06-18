import { ServiceConfig } from './Types';

export const Services: ServiceConfig[] = 
  [{
    id: 'ocr-space',
    connector: 'ocr-space',
    displayName: 'OCR.space',
    description: 'Free onlione OCR API provided by OCR.space.',
    parameters: {
      language: {
        type: 'string',
        options: {
          ara: 'Arabic',
          bul: 'Bulgarian',
          chs: 'Chinese (Simplified)',
          cht: 'Chinese (Traditional)',
          hrv: 'Croatian',
          cze: 'Czech',
          dan: 'Danish',
          dut: 'Dutch',
          eng: 'English',
          fin: 'Finnish',
          fre: 'French',
          ger: 'German',
          gre: 'Greek',
          hun: 'Hungarian',
          kor: 'Korean',
          ita: 'Italian',
          jpn: 'Japanese',
          pol: 'Polish',
          por: 'Portuguese',
          rus: 'Russian',
          slv: 'Slovenian',
          spa: 'Spanish',
          swe: 'Swedish',
          tha: 'Thai',
          tur: 'Turkish',
          ukr: 'Ukrainian',
          vnm: 'Vietnamese'
        }
      }
    }
  },{
    id: 'google-vision',
    connector: 'google-vision',
    displayName: 'Google Vision',
    description: 'OCR text detection via the Google Cloud Vision API'
  }];