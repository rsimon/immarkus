import { useMemo } from 'react';
import { Annotation, AnnotationState, DrawingStyleExpression, ImageAnnotation } from '@annotorious/react';
import { useRelationEditor } from './RelationEditorRoot';

export const useRelationEmphasisStyle = (
  enabled: boolean,
  base: DrawingStyleExpression
) => {
  const { source, target } = useRelationEditor();

  const chained = useMemo(() => {
    if (enabled) {
      const emphasis: DrawingStyleExpression = (a: ImageAnnotation, state?: AnnotationState) => {
        if (a.id === source?.id) {
          return {
            stroke: '#c026d3',
            strokeOpacity: 1,
            strokeWidth: 3
          }
        } else if (a.id === target?.id) {
          return {
            stroke: '#22c55e',
            strokeOpacity: 1,
            strokeWidth: 3
          }
        } else if (state?.hovered) {
          return {
            stroke: '#22c55e',
            strokeOpacity: 1,
            strokeWidth: 1.2
          }
        }
      };

      return chainStyles(base, emphasis);
    } else {
      return base;
    }
  }, [enabled, base, source, target]);

  return chained;

}

/** 
 * Note that this method will be available in @annotorious/react,
 * starting with the next version (3.0.7).
 */
export const chainStyles = <T extends Annotation = Annotation>(
  applyFirst: DrawingStyleExpression<T>,
  applySecond: DrawingStyleExpression<T>
) => {
  if (typeof applyFirst !== 'function' && typeof applySecond !== 'function') {
    // Simple case: just two objects
    return {
      ...(applyFirst || {}),
      ...(applySecond || {})
    };
  } else {
    // Return a function
    return (a: T, state: AnnotationState) => {
      const first = typeof applyFirst === 'function' ? applyFirst(a, state) : applyFirst;
      const second = typeof applySecond === 'function' ? applySecond(a, state) : applySecond;

      return {
        ...(first || {}),
        ...(second || {})
      }
    }
  }
}