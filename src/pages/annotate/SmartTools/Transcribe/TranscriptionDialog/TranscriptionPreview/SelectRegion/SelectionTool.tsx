import { useEffect, useState } from 'react';
import { useViewer } from '@annotorious/react';

interface SelectionToolProps {

}

type Corner = { x: number, y: number };

export const SelectionTool = (props: SelectionToolProps) => {

  const viewer = useViewer();

  const [start, setStart] = useState<Corner | undefined>();

  const [end, setEnd] = useState<Corner | undefined>();

  useEffect(() => {
    if (!viewer?.element) return;

    viewer.setMouseNavEnabled(false);

    const el = viewer.element;

    const onPointerDown = (evt: PointerEvent) => {
      console.log('DOWN');

      const { offsetX: x, offsetY: y } = evt;
      setStart({ x, y });
      setEnd(undefined);
    }

    const onPointerMove = (evt: PointerEvent) => {
      console.log('MOVE');

      const { offsetX: x, offsetY: y } = evt;
      if (start)
        setEnd({ x, y });
    }

    const onPointerUp = (evt: PointerEvent) => {
      console.log('UP');
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);

    return () => {
      viewer.setMouseNavEnabled(true);

      el?.removeEventListener('pointerdown', onPointerDown);
      el?.removeEventListener('pointermove', onPointerMove);
      el?.removeEventListener('pointerup', onPointerUp);
    }
  }, [viewer?.element]);

  return (start && end) ? (
    <div 
      className="absolute border-blue-400"
      style={{
        left: `${start.x}px`,
        top: `${start.y}px`,
        width: `${end.x - start.x}px`,
        height: `${end.y - start.y}px`
      }} />
  ) : null;

}