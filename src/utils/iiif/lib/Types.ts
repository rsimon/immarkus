import { Canvas } from '@iiif/presentation-3';

export type IIIFContentType = 'PRESENTATION_MANIFEST' | 'IIIF_IMAGE';

export const isIIIFIdentifyResult = (result: IdentifyResult): result is IIIFIdentifyResult =>
  (result as IIIFIdentifyResult).majorVersion !== undefined;

export const isImageFileIdentifyResult = (result: IdentifyResult): result is ImageFileIdentifyResult =>
  (result as ImageFileIdentifyResult).type === 'IMAGE_FILE';

export interface IIIFIdentifyResult {

  label?: string;

  type: IIIFContentType;

  majorVersion: 2 | 3;

}

export interface ImageFileIdentifyResult {

  type: 'IMAGE_FILE';

}

export type IdentifyResult = IIIFIdentifyResult | ImageFileIdentifyResult;

export interface IIIFParseResult extends IIIFIdentifyResult {

  parsed: Canvas[];

  raw: any;

}

export type ParseError = {
  
  type: 'VALIDATION_ERROR' | 'UNSUPPORTED_FORMAT' | 'FETCH_ERROR';

  message: string;

}

/** Convenience type to abstract over IIIF / plain image file differences **/
interface BaseImage {

  width: number;

  height: number;

}

export interface IIIFImage extends BaseImage {

  type: 'IIIF_IMAGE';

  id: string;

  format: string;

  service?: {

    majorVersion: number;

    profileLevel: number;
    
  }
  
  jsonld: any;

}

export interface ImageFile extends BaseImage {

  type: 'IMAGE_FILE';

  url: string;

}

export type Image = IIIFImage | ImageFile;