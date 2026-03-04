import type { ImageAnnotation, W3CImageAnnotation } from '@annotorious/react';

export type FilterValue = 'all' 
  | 'with_entity' 
  | 'without_entity' 
  | 'with_relationship' 
  | `entity-${string}`
  | `rel-${string}`;

export interface FilterState {

  value: FilterValue | FilterValue[];

  fn: ((a: W3CImageAnnotation | ImageAnnotation) => boolean);

}