import { useCallback, useEffect, useRef, useState } from 'react';

export const useCollapsibleToolbar = () => {

  const ref = useRef<HTMLElement>(null);

  const [breakpoint, setBreakpoint] = useState(0);

  const [collapsed, setCollapsed] = useState(true);

  const checkCollapse = useCallback(() => {
    if (!ref.current) return;
    
    const shouldCollapse = ref.current.scrollWidth > ref.current.clientWidth;
    
    if (shouldCollapse && !collapsed) {
      setBreakpoint(window.innerWidth);
      setCollapsed(true);
    } else if (!shouldCollapse && window.innerWidth > breakpoint) {
      setCollapsed(false);
    }
  }, [collapsed, breakpoint]);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(checkCollapse);
    });

    const onWindowResize = () =>
      requestAnimationFrame(checkCollapse);

    // Initial check after mounting
    requestAnimationFrame(checkCollapse);

    resizeObserver.observe(ref.current);
    
    window.addEventListener('resize', onWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', onWindowResize);
    };
  }, [checkCollapse]);

  return { ref, collapsed };

}