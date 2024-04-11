import { useEffect, useState } from 'react';
import { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { GraphNode } from '../Types';
import {
  useFloating,
  shift,
  inline,
  autoUpdate,
  autoPlacement,
  offset
} from '@floating-ui/react';


interface DetailsPopupProps {

  selected?: NodeObject<GraphNode>;

  forceGraph: ForceGraphMethods;

}

/** 
 * Wraps a single DOMRect into an object that properly
 * implements the DOMRectList interface.
 */
const toClientRects = (rect: DOMRect) => ({
  length: 1,
  item: (index: number) => index === 0 ? rect : undefined,
  [Symbol.iterator]: function* (): IterableIterator<DOMRect> {
    for (let i = 0; i < this.length; i++)
      yield this.item(i)!;
  }
} as DOMRectList)

export const DetailsPopup = (props: DetailsPopupProps) => {

  const { selected, forceGraph } = props;

  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      inline(), 
      offset(10),
      autoPlacement(),
      shift({ crossAxis: true })
    ],
    whileElementsMounted: autoUpdate
  });

  useEffect(() => {
    if (selected && forceGraph) {
      const { x, y } = selected;

      const pt = forceGraph.graph2ScreenCoords(x, y);

      // TODO
      const rect = new DOMRect(pt.x + 250, pt.y, 1, 1);

      refs.setReference({
        getBoundingClientRect: () => rect,
        getClientRects: () => toClientRects(rect)
      });

      setIsOpen(true);
    }
  }, [selected, forceGraph]);

  return isOpen && (
    <div 
      className="text-white bg-black p-1 rounded"
      ref={refs.setFloating}
      style={floatingStyles}>
      Floating
    </div>
  )

}