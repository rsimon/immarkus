import { useEffect } from 'react';
import { AnnotoriousImageAnnotator, useAnnotator } from '@annotorious/react';

export const AnnotoriousKeyboardPlugin = () => {

  const anno = useAnnotator<AnnotoriousImageAnnotator>();

  useEffect(() => {
    if (!anno) return;

    const onKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape')
        anno.cancelDrawing();
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    }
  }, [anno]);

  return null;

}