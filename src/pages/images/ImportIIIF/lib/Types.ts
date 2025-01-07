import { Canvas } from '@iiif/presentation-3';

export type IIIFContentType = 'PRESENTATION_MANIFEST' | 'IIIF_IMAGE';

export const isIIIFIdentifyResult = (result: IdentifyResult): result is IIIFIdentifyResult =>
  (result as IIIFIdentifyResult).majorVersion !== undefined;

export const isImageFileIdentifyResult = (result: IdentifyResult): result is ImageFileIdentifyResult =>
  (result as ImageFileIdentifyResult).type === 'PLAIN_IMAGE';

export interface IIIFIdentifyResult {

  type: IIIFContentType;

  majorVersion: 2 | 3;

}

export interface ImageFileIdentifyResult {

  type: 'PLAIN_IMAGE';

}

export type IdentifyResult = IIIFIdentifyResult | ImageFileIdentifyResult;

export interface IIIFParseResult extends IIIFIdentifyResult {

  parsed: Canvas[];

  raw: any;

}

export type ParseError = {
  
  type: 'VALIDATION_ERROR' | 'UNSUPPORTED_FORMAT';

  message: string;

}