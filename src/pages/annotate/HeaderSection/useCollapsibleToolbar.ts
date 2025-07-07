import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface CollapseInfo {

  level: number;

  breakpoint: number;

}

export const useCollapsibleToolbar = (levels: number) => {

  const ref = useRef<HTMLElement>(null);

  const collapseStack = useRef<CollapseInfo[]>([...Array(levels).keys()].map((_, idx) => ({
    level: idx,
    breakpoint: 0
  })));

  const [collapseLevel, setCollapseLevel] = useState(levels);

  const checkCollapse = useCallback(() => {
    if (!ref.current) return;
    
    const isOverflowing = ref.current.scrollWidth > ref.current.clientWidth;

    const stack = collapseStack.current;
    const last = stack.length > 0 ? stack[stack.length - 1] : undefined;
    
    if (isOverflowing) {
      // Increase collapse level
      const nextLevel = last ? last.level + 1 : 0;
      if (nextLevel < levels) {
        stack.push({ level: nextLevel, breakpoint: window.innerWidth });
        setCollapseLevel(nextLevel);
      }
    } else if (!isOverflowing && stack.length > 0 && window.innerWidth > last.breakpoint) {
      // Reduce collapse level
      if (stack.length > 1) {
        const popped = stack.pop();
        setCollapseLevel(popped ? popped.level - 1 : 0);
      }
    }
  }, [collapseLevel]);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(checkCollapse);
    });

    const onWindowResize = () =>
      requestAnimationFrame(checkCollapse);

    // Initial check after mounting
    setTimeout(() => checkCollapse(), 200);

    resizeObserver.observe(ref.current);
    
    window.addEventListener('resize', onWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', onWindowResize);
    };
  }, [checkCollapse]);

  return { ref, collapseLevel };

}