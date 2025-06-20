import { useEffect, useMemo, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { useViewer } from '@annotorious/react';
import { Region } from '@/services';

interface SelectionToolProps {

  onSelect(region: Region): void;

}

type Corner = { x: number, y: number };

export const SelectionTool = (props: SelectionToolProps) => {

  const viewer = useViewer();

  const dimensions = useMemo(() => {
    if (!viewer) return;

    return viewer.world.getItemAt(0)?.source?.dimensions;
  }, [viewer]);

  const [start, setStart] = useState<Corner | undefined>();

  const [end, setEnd] = useState<Corner | undefined>();

  useEffect(() => {
    if (!viewer?.element) return;

    const el = viewer.element;

    // Redundancy... but this avoids inefficiencies
    // when putting `end` in the dependency array.
    let currentEnd: Corner;

    const onPointerDown = (evt: PointerEvent) => {
      const { offsetX: x, offsetY: y } = evt;
      setStart({ x, y });
      setEnd(undefined);
      currentEnd = undefined;
    }

    const onPointerMove = (evt: PointerEvent) => {
      const { offsetX: x, offsetY: y } = evt;
      if (start) {
        setEnd({ x, y });
        currentEnd = { x, y };
      }
    }

    const onPointerUp = () => {
      if (!currentEnd || !dimensions) return;

      const elementStart = new OpenSeadragon.Point(start.x, start.y);
      const elementEnd = new OpenSeadragon.Point(currentEnd.x, currentEnd.y);

      const imageStart = viewer.viewport.viewerElementToImageCoordinates(elementStart);
      const imageEnd = viewer.viewport.viewerElementToImageCoordinates(elementEnd);

      const origX = Math.min(imageStart.x, imageEnd.x);
      const origY = Math.min(imageStart.y, imageEnd.y);

      const origW = Math.abs(imageEnd.x - imageStart.x);
      const origH = Math.abs(imageEnd.y - imageStart.y);

      // Discard any box that's fully outside the image
      const hasNoOverlap =  (
        origX + origW <= 0   || // selection is left of the image
        origX > dimensions.x || // selection is right of the image
        origY + origH <= 0   || // selection is above image
        origY > dimensions.y    // selection is below image
      );

      if (hasNoOverlap) {
        setStart(undefined);
        return;

      } else {
        // Trim selection bounds to size of the image
        const x = Math.max(0, origX);
        const y = Math.max(0, origY);

        const trimmedW = origW - (x - origX);
        const trimmedH = origH - (y - origY);

        const maxWidth = dimensions.x - x;
        const maxHeight = dimensions.y - y;

        const w = Math.min(maxWidth, trimmedW);
        const h = Math.min(maxHeight, trimmedH);

        if (w * h > 0)      
          props.onSelect({ x, y, w, h });
        else 
          setStart(undefined); // Edge case, should never happen
      }
    }

    viewer.setMouseNavEnabled(false);
    
    el.style.cursor = 'crosshair';

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    document.body.addEventListener('pointerup', onPointerUp);

    return () => {
      document.body.removeEventListener('pointerup', onPointerUp);
      
      if (el) {
        el.style.cursor = null;

        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
      }

      try {
        viewer?.setMouseNavEnabled(true);
      } catch {
        // Ignore
      }
    }
  }, [viewer?.element, start, props.onSelect]);

  const getStyle = (offset = 0) => ({
    left: `${Math.min(start.x, end.x) - offset}px`,
    top: `${Math.min(start.y, end.y) - offset}px`,
    width: `${Math.abs(end.x - start.x) + 2 * offset}px`,
    height: `${Math.abs(end.y - start.y) + 2 * offset}px`
  })

  return (start && end) ? (
    <>
      <div 
        className="absolute border-[3px] border-white/60"
        style={getStyle(1)} />

      <div 
        className="absolute border-[1px] border-black border-dashed"
        style={getStyle(0)} />
    </>
  ) : null;

}