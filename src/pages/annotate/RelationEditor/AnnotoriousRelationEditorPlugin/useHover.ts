import { useEffect, useState } from 'react';
import { ImageAnnotation, useAnnotator } from '@annotorious/react';

/**
 * Note that this hook will be availble through @annotorious/react later.
 */
export const useHover = () => {
  const anno = useAnnotator();

  const [hover, setHover] = useState<ImageAnnotation>();

  useEffect(() => {
    if (!anno) return;

    const { hover, store } = anno.state;

    const unsubscribeHover = hover.subscribe(id => {
      if (id) {
        const annotation = store.getAnnotation(id);
        setHover(annotation);
      } else {
        setHover(undefined);
      }
    });
  
    return () => {
      unsubscribeHover();
    }
  }, [anno]);

  return hover;
}