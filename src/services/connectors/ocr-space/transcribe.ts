import { TranscriptionServiceResponse } from '@/services/Types';

const { VITE_OCR_SPACE_KEY } = import.meta.env;

interface OCRSpaceOptions {

  language: string;

  mergeLines?: boolean

}

const isOCRSpaceOptions = (opts: Record<string, any>): opts is OCRSpaceOptions => 
  typeof opts.language === 'string';

export const transcribe = (
  image: File | string, 
  options?: Record<string, any>
): Promise<TranscriptionServiceResponse> => {
  if (!isOCRSpaceOptions(options)) {
    console.error(options);
    return Promise.reject('Invalid OCR options');
  }

  const generator = {
    id: 'ocr-space',
    name: 'OCR.space',
    homepage: 'https://ocr.space'
  };
  
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
  }).then(res => res.json()).then(data => ({ data, generator }));
}
