import { useEffect, useRef, useState } from 'react';

export const useCollapsibleToolbar = () => {

  const toolbarRef = useRef(null);

  const [breakpoint, setBreakpoint] = useState(0);

  const [collapsed, setCollapsed] = useState(false);

  const onResize = () => {
    const el = toolbarRef.current?.closest('.mosaic-window-toolbar');

    const toolbarWidth = el.clientWidth;

    // Is the toolbar scrollable?
    const shouldCollapse = el.scrollWidth > toolbarWidth;

    if (shouldCollapse && !collapsed) {
      setBreakpoint(toolbarWidth);
      setCollapsed(true);
    } else if (!shouldCollapse && toolbarWidth > breakpoint) {
      setCollapsed(false);
    }
  };

  useEffect(() => {
    onResize();
  }, []);

  return { toolbarRef, collapsed, onResize };

}