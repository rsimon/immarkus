import { useEffect, useState } from 'react';
import { NodeObject } from 'react-force-graph-2d';
import { useStore } from '@/store';
import { EntityTypeDetails } from './EntityTypeDetails';
import { ImageDetails } from './ImageDetails';
import { Graph, GraphNode, GraphViewportTransform } from '../Types';
import {
  autoPlacement,
  autoUpdate,
  inline,
  offset,
  shift,
  useFloating
} from '@floating-ui/react';

interface DetailsPopupProps {

  anchor: NodeObject<GraphNode>;

  graph: Graph;

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

  const { id, type } = anchor;

  const store = useStore();

  const [x, setX] = useState<number | undefined>();
  const [y, setY] = useState<number | undefined>();

  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    middleware: [
      inline(), 
      offset(14),
      autoPlacement({ allowedPlacements: ['left-end', 'left-start', 'right-end', 'right-start']}),
      shift({ crossAxis: true })
    ],
    whileElementsMounted: autoUpdate
  });

  useEffect(() => {
    if (anchor && transform) {
      const { x, y } = transform(anchor.x, anchor.y);

      // Primitives, so we avoid unnecessary re-renders!
      setX(x);
      setY(y);
    }
  }, [anchor, transform]);

  useEffect(() => {
    const rect = new DOMRect(x, y, 1, 1);

    refs.setReference({
      getBoundingClientRect: () => rect,
      getClientRects: () => toClientRects(rect)
    });
  }, [x, y]);

  return (
    <div 
      className="max-h-[50vh] overflow-y-scroll rounded-md w-[300px] bg-white backdrop-blur-sm shadow-md border z-20"
      ref={refs.setFloating}
      style={floatingStyles}>
      {type === 'ENTITY_TYPE' ? (
        <EntityTypeDetails 
          graph={props.graph}
          type={store.getDataModel().getEntityType(id)} />
      ) : (
        <ImageDetails
          image={store.getImage(id)} />
      )}
    </div>
  )

}