import { useEffect, useState } from 'react';
import { NodeObject } from 'react-force-graph-2d';
import { GraphNode, GraphViewportTransform } from '../Types';
import {
  useFloating,
  shift,
  inline,
  autoUpdate,
  autoPlacement,
  offset
} from '@floating-ui/react';


interface DetailsPopupProps {

  anchor?: NodeObject<GraphNode>;

  transform?: GraphViewportTransform;

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

  const { anchor, transform } = props;

  const [open, setOpen] = useState(false);

  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    open,
    onOpenChange: setOpen,
    middleware: [
      inline(), 
      offset(10),
      autoPlacement(),
      shift({ crossAxis: true })
    ],
    whileElementsMounted: autoUpdate
  });

  useEffect(() => {
    if (anchor && transform) {
      const { x, y } = transform(anchor.x, anchor.y);
      const rect = new DOMRect(x, y, 1, 1);

      refs.setReference({
        getBoundingClientRect: () => rect,
        getClientRects: () => toClientRects(rect)
      });

      setOpen(true);
    } else {
      setOpen(false)
    }
  }, [anchor, transform]);

  return open && (
    <div 
      className="text-white bg-black p-1 rounded"
      ref={refs.setFloating}
      style={floatingStyles}>
      Floating
    </div>
  )

}