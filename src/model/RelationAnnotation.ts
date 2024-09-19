import type { Annotation, AnnotationTarget } from '@annotorious/react';

/** 
 * Because this doesn't exist in Annotorious out of the box:
 * a sub-type of Annotation to model relations between annotations.
 */
export interface RelationAnnotation extends Annotation {

  motivation: 'linking';

  target: RelationAnnotationTarget;

}

export interface RelationAnnotationTarget extends AnnotationTarget {

  selector: {

    from: string;

    to: string;  
  }

}