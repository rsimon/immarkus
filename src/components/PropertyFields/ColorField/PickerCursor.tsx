import { useEffect } from 'react';

import './PickerCursor.css';

export const PickerCursor = () => {

  useEffect(() => {
    document.documentElement.classList.add('color-picker');
    // window.addEventListener('mousemove', onMouseMove);

    return () => {
      document.documentElement.classList.remove('color-picker');
      // window.removeEventListener('mousemove', onMouseMove);
    }
  }, []);
   
  return null;

}