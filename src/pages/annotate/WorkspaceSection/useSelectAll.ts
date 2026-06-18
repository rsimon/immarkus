import { useEffect } from 'react';

const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);

export const useSelectAll = (onSelectAll: () => void) => {

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === 'a') {
        e.preventDefault();
        onSelectAll();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [onSelectAll]);
  
}