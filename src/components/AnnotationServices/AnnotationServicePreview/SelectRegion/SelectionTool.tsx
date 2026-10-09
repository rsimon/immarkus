import { useEffect, useMemo, useState } from 'react';
import { type Viewer, Point } from 'openseadragon';
import { useViewer } from '@annotorious/react';
import { Region } from '@/services';
import { getRotatedImageSize, imageToRotatedCoordinates } from '../../rotationUtils';

const viewerOffsetPointToImageXY = (
  viewer: Viewer,
  xy: Point
): Point => {
  const viewport = viewer.viewport;

  if (viewport.getFlip()) {
    const containerSize = viewport.getContainerSize();

    // Mirror X across container center
    const px = containerSize.x - xy.x;
    const py = xy.y;

    // Map mirrored coords to un-rotated viewport coords
    const bounds = viewport.getBoundsNoRotate(true);
    const unrotatedVx = bounds.x + (px / containerSize.x) * bounds.width;
    const unrotatedVy = bounds.y + (py / containerSize.x) * bounds.width;

    const rotation = viewport.getRotation(true);

    if (rotation === 0) {
      // Quicker path if flip but no rotation
      return viewport.viewportToImageCoordinates(new Point(unrotatedVx, unrotatedVy));
    } else {
      // Flip + rotation: counter-rotate viewport point around viewport center
      const center = viewport.getCenter(true);
      const rad = (-rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const dvx = unrotatedVx - center.x;
      const dvy = unrotatedVy - center.y;

      const finalVx = center.x + dvx * cos - dvy * sin;
      const finalVy = center.y + dvx * sin + dvy * cos;

      return viewport.viewportToImageCoordinates(new Point(finalVx, finalVy));
    }
  } else {
    // Quick path if viewport is not flipped
    return viewport.viewportToImageCoordinates(viewport.pointFromPixel(xy, true));
  }
}

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

    const onCreateSelection = () => {
      if (!start || !currentEnd) return;

      const elementStart = new Point(start.x, start.y);
      const elementEnd = new Point(currentEnd.x, currentEnd.y);

      const imageStart = viewerOffsetPointToImageXY(viewer, elementStart);
      const imageEnd = viewerOffsetPointToImageXY(viewer, elementEnd);

      const rotation = viewer.viewport.getRotation();
      const isFlipped = viewer.viewport.getFlip();

      const orientedStart = imageToRotatedCoordinates(
        imageStart, dimensions.x, dimensions.y, rotation, isFlipped);
        
      const orientedEnd = imageToRotatedCoordinates(
        imageEnd, dimensions.x, dimensions.y, rotation, isFlipped);

      const origX = Math.min(orientedStart.x, orientedEnd.x);
      const origY = Math.min(orientedStart.y, orientedEnd.y);

      const origW = Math.abs(orientedEnd.x - orientedStart.x);
      const origH = Math.abs(orientedEnd.y - orientedStart.y);
      const orientedSize = getRotatedImageSize(dimensions.x, dimensions.y, rotation);

      // Discard any box that's fully outside the image
      const hasNoOverlap =  (
        origX + origW <= 0   || // selection is left of the image
        origX > orientedSize.width || // selection is right of the image
        origY + origH <= 0   || // selection is above image
        origY > orientedSize.height    // selection is below image
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

        const maxWidth = orientedSize.width - x;
        const maxHeight = orientedSize.height - y;

        const w = Math.min(maxWidth, trimmedW);
        const h = Math.min(maxHeight, trimmedH);

        if (w * h > 0)      
          props.onSelect({ x, y, w, h, rotation, isFlipped });

        setStart(undefined);
      }
    }

    const onPointerDown = (evt: PointerEvent) => {
      if (!start) {
        // No start corner yet - start new selection
        const { offsetX: x, offsetY: y } = evt;
        setStart({ x, y });
        setEnd(undefined);
        currentEnd = undefined;
      } else {
        // User started with a click, this is the "closing" click
        onCreateSelection();
      }
    }

    const onPointerMove = (evt: PointerEvent) => {
      const { offsetX: x, offsetY: y } = evt;
      if (start) {
        // User is dragging
        setEnd({ x, y });
        currentEnd = { x, y };
      }
    }

    const onPointerUp = () => {
      if (!dimensions || !start) return;

      if (currentEnd) {
        // User dragged - complete selection
        onCreateSelection();
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
        className="absolute border border-black border-dashed"
        style={getStyle(0)} />
    </>
  ) : null;

}