import type { Canvas  } from '@iiif/presentation-3';
import { Traverse } from '@iiif/parser';
import { convertPresentation2  } from '@iiif/parser/presentation-2';
import { identify } from './identify';
import { isImageFileIdentifyResult, ParseError, IIIFParseResult } from './Types';

const parsePresentationV3 = (manifest: any): Canvas[] => {
  const canvases: Canvas[] = [];

  const modelBuilder = new Traverse({
    canvas: [canvas => canvases.push(canvas)]
  });


  modelBuilder.traverseManifest(manifest);
  return canvases;
}

export const parseIIIF = (data: any): { result?: IIIFParseResult, error?: ParseError } => {
  const { result, error } = identify(data);

  if (error || !result) return { error };

  if (isImageFileIdentifyResult(result)) return { error: { type: 'VALIDATION_ERROR', message: 'No IIIF content' }};

  const { type, majorVersion } = result;

  if (type === 'PRESENTATION_MANIFEST') {
    const v3 = majorVersion === 2 ? convertPresentation2(data) : data;
    const parsed = parsePresentationV3(v3);

    return { 
      result: {
        type,
        majorVersion,
        parsed,
        raw: data
      }
    }
  } else if (type === 'IIIF_IMAGE') {
    if (majorVersion === 2) {

    } else if (majorVersion === 3) {

    } else {
      return { error: { type: 'UNSUPPORTED_FORMAT', message: `Unsupported major version: ${majorVersion}` }}
    }
  }

  return {};

}