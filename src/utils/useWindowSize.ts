import { useEffect, useState } from "react";

export interface WindowSize {

  height: number;

  width: number;

}

export const useWindowSize = () => {

  const [size, setSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const onResize = () => 
      setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  return size;

}