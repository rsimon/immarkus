import { useEffect, useRef } from 'react';

export const useClickOutside = (elementRef: React.MutableRefObject<HTMLElement>, callback: () => void) => {

  const callbackRef = useRef(callback);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      event.preventDefault()

      if (elementRef && elementRef.current && !elementRef.current.contains(event.target as Node)) {
        callbackRef.current()
      }

      return;
    }

    document.addEventListener('click', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [elementRef, callback]);

}