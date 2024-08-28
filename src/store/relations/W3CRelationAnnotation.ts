import { W3CAnnotation } from '@annotorious/react';

/**
 * Because this doesn't exist in Annotorious (nor the W3C model) out of the box: a
 * W3C Annotation model extension to represent relation links.
 */
export interface W3CRelationLinkAnnotation extends Omit<W3CAnnotation, 'body'> {

  motivation: 'linking';

  body: string;

  target: string;

}

export interface W3CRelationMetaAnnotation extends Omit<W3CAnnotation, 'target'> {

  target: string;

}