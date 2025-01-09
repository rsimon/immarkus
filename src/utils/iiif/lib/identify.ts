import { getProperty, getLabelValue } from './helpers';
import { ParseError, IdentifyResult, IIIFIdentifyResult } from './Types';

export const identifyIIIF = (data: any): { result?: IdentifyResult, error?: ParseError } => {
  const context = Array.isArray(data['@context'])
    ? data['@context'].find(str => str.includes('iiif.io/api/'))
    : data['@context'];

  if (!context) return { error: { type: 'VALIDATION_ERROR', message: 'Missing @context' }};

  const id = getProperty(data, 'id');

  if (!id) return { error: { type: 'VALIDATION_ERROR', message: 'Missing id property' }};

  const result: IIIFIdentifyResult = 
    context.includes('iiif.io/api/presentation/2') ? { type: 'PRESENTATION_MANIFEST', majorVersion: 2 } :
    context.includes('iiif.io/api/presentation/3') ? { type: 'PRESENTATION_MANIFEST', majorVersion: 3 } :
    context.includes('iiif.io/api/image/2') ? { type: 'IIIF_IMAGE', majorVersion: 2 } :
    context.includes('iiif.io/api/image/3') ? { type: 'IIIF_IMAGE', majorVersion: 3 } : undefined;

  if (!result) return { error: { type: 'UNSUPPORTED_FORMAT', message: `Unsupported context: ${context}` }};

  const label = getLabelValue(data, 'label');

  return { result: {...result, label } };

}