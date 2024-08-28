import { W3CImageFormat } from '@annotorious/react';
import type { RelationAnnotation } from '@/model';
import type { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from './W3CRelationAnnotation';
import type { 
  FormatAdapter, 
  ImageAnnotation, 
  ParseResult, 
  W3CImageAnnotation, 
  W3CImageFormatAdapter, 
  W3CImageFormatAdapterOpts
} from '@annotorious/react';

const isConnectionAnnotation = (arg: any): arg is RelationAnnotation => 
  arg.motivation !== undefined && arg.motivation === 'linking';

const isW3CRelationLinkAnnotation = (arg: any): arg is W3CRelationLinkAnnotation =>
  arg.motivation !== undefined && 
  arg.motivation === 'linking' &&
  arg.body !== undefined && 
  arg.target !== undefined &&
  typeof arg.body === 'string' && 
  typeof arg.target === 'string';

type AnnotationType = ImageAnnotation | RelationAnnotation;

type W3CAnnotationType = W3CImageAnnotation | W3CRelationLinkAnnotation | [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation];

/**
 * A custom Annotorious format adapter that handles ImageAnnotations, as well
 * as our custom extension for relation annotations. 
 */
export type W3CRelationFormatAdapter = FormatAdapter<
  // Internal model
  AnnotationType,
  // Serialized to W3C - hellishly complicated but standards-compliant...
  W3CAnnotationType>;

export const W3CImageRelationFormat = (
  source?: string,
  opts: W3CImageFormatAdapterOpts = { strict: true, invertY: false }
): W3CRelationFormatAdapter => {
  const imageAdapter = W3CImageFormat(source, {...opts, strict: false });

  const parse = (serialized: W3CImageAnnotation | W3CRelationLinkAnnotation | [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation]) =>
    parseW3C(serialized, imageAdapter);

  const serialize = (annotation: ImageAnnotation | RelationAnnotation) =>
    serializeW3C(annotation, imageAdapter);

  return { parse, serialize }
}

export const parseW3C = (
  arg: W3CImageAnnotation | W3CRelationLinkAnnotation | [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation],
  imageAdapter: W3CImageFormatAdapter 
): ParseResult<ImageAnnotation | RelationAnnotation> => {
  if (Array.isArray(arg)) {
 
    // TODO implement support for "annotated annotations"
    throw 'Not yet implemented';
    
  } else if (isW3CRelationLinkAnnotation(arg)) {
    const { id, body, target } = arg;

    const parsed: RelationAnnotation = {
      id,
      motivation: 'linking',
      bodies: [],
      target: {
        annotation: id,
        selector: {
          from: target,
          to: body
        }
      }
    };

    return { parsed };
  } else {
    return imageAdapter.parse(arg)
  }
}

export const serializeW3C = (
  annotation: ImageAnnotation | RelationAnnotation, 
  imageAdapter: W3CImageFormatAdapter
): W3CImageAnnotation | W3CRelationLinkAnnotation | [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation] => {
  if (isConnectionAnnotation(annotation)) {
    const { id, target: { selector: { from, to }} } = annotation;

    return { 
      id,
      motivation: 'linking',
      body: to,
      target: from
    } as W3CRelationLinkAnnotation;
  } else {
    return imageAdapter.serialize(annotation)
  }
}