import { useMemo } from 'react';
import { Annotation, AnnotationState, DrawingStyle, DrawingStyleExpression, ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { Store, useStore } from '@/store';
import { useRelationEditor } from '../RelationEditorRoot';

const ENABLE_CONNECTOR_PLUGIN = import.meta.env.VITE_ENABLE_CONNECTOR_PLUGIN === 'true';

/*
export const isConnectedTo = (sourceId: string, store: Store) =>
  new Set(store.getRelatedAnnotations(sourceId).reduce<string[]>((all, [link, _]) => {
    const { target, body } = link;
    return [...all, target, body].filter(id => id !== sourceId);
  }, []));
*/

export const useRelationEmphasisStyle = (
  enabled: boolean,
  base: DrawingStyleExpression
) => {

  if (ENABLE_CONNECTOR_PLUGIN)
    return base;

  const store = useStore();

  const { selected } = useSelection();

  const { source, target } = useRelationEditor();

  const enabledStyle = useMemo(() => {
    // const alreadyConnected = source?.id ? isConnectedTo(source.id, store) : new Set([]);

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
          return /* !alreadyConnected.has(a.id) && */ {
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
  }, [enabled, base, source, target, store]);

  const defaultStyle: DrawingStyleExpression = useMemo(() => {
    // This style isn't needed when the editor is enabled 
    if (enabled || (selected || []).length === 0) return base;

    const related = new Set(
      store.getRelatedAnnotations(selected[0].annotation.id)
        // get all links on the selected annotation
        .map(([link, _]) => link)
        // flatten all body/target ids
        .reduce<string[]>((all, link) => ([...all, link.body, link.target]), [])
        // remove own id
        .filter(id => id !== selected[0].annotation.id));

    return (a: Annotation, state?: AnnotationState) => {
      return related.has(a.id) ? {
        ...base,
        stroke: '#22c55e',
        strokeOpacity: 1,
        strokeWidth: 3
      } as DrawingStyle : computeStyle(a, base, state);
    };
  }, [enabled, base, selected.map(s => s.annotation.id).join('-')]);
  
  return enabled ? enabledStyle : defaultStyle;

}

/** 
 * Note that these methods will be available in @annotorious/react,
 * starting with the next version (3.0.7).
 */
export const computeStyle = <T extends Annotation = Annotation>(
  annotation: T,
  style: DrawingStyleExpression<T>,
  state?: AnnotationState
) => {
  return typeof style === 'function' ? style(annotation, state) : style;
};

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