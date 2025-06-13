import { useEffect, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { useViewer } from '@annotorious/react';
import { Region } from '../../../Types';

interface SelectionToolProps {

  onSelect(region: Region): void;

}

type Corner = { x: number, y: number };

export const SelectionTool = (props: SelectionToolProps) => {

  const viewer = useViewer();

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
      if (!currentEnd) return;

      const elementStart = new OpenSeadragon.Point(start.x, start.y);
      const elementEnd = new OpenSeadragon.Point(currentEnd.x, currentEnd.y);

      const imageStart = viewer.viewport.viewerElementToImageCoordinates(elementStart);
      const imageEnd = viewer.viewport.viewerElementToImageCoordinates(elementEnd);

      const x = Math.min(imageStart.x, imageEnd.x);
      const y = Math.min(imageStart.y, imageEnd.y);
      const w = Math.abs(imageEnd.x - imageStart.x);
      const h = Math.abs(imageEnd.y - imageStart.y);
      
      props.onSelect({ x, y, w, h });
    }

    viewer.setMouseNavEnabled(false);
    
    el.style.cursor = 'crosshair';

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);

    return () => {
      viewer?.setMouseNavEnabled(true);

      el.style.cursor = null;

      el?.removeEventListener('pointerdown', onPointerDown);
      el?.removeEventListener('pointermove', onPointerMove);
      el?.removeEventListener('pointerup', onPointerUp);
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