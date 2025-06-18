import { ImageAnnotation } from '@annotorious/react';
import { ServiceConnector } from '@/services/Types';

const { VITE_OCR_SPACE_KEY } = import.meta.env;

export interface OCRSpaceOptions {

  language: string;

  mergeLines?: boolean

}

export const isOCROptions = (opts: Partial<OCRSpaceOptions>): opts is OCRSpaceOptions => 
  typeof opts.language === 'string';

const submit = (
  image: File | string, 
  options?: OCRSpaceOptions
) => {
  if (!isOCROptions(options)) {
    console.error(options);
    return Promise.reject('Invalid OCR options');
  }
  
  const formData  = new FormData();
  formData.append('apikey', VITE_OCR_SPACE_KEY);
  formData.append('language', options.language);
  formData.append('isOverlayRequired', 'true');
  formData.append('detectOrientation', 'true');

  if (typeof image === 'string')
    formData.append('url', image);
  else 
    formData.append('file', image, image.name);

  return fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData
  }).then(res => res.json());
}

const parseResponse = (data: any, options?: Record<string, any>): ImageAnnotation[] => {
  return [];
} 

export const OCRSpaceConnector: ServiceConnector = { submit, parseResponse };