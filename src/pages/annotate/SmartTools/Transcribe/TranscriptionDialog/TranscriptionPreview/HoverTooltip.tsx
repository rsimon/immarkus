import { useMemo } from 'react';
import { ImageAnnotation } from '@annotorious/react';

interface HoverTooltipProps {

  annotation: ImageAnnotation;

}

export const HoverTooltip = (props: HoverTooltipProps) => {

  const label = useMemo(() => {
    const { bodies } = props.annotation;
    const comment = bodies.find(b => (b.purpose === 'commenting' || !b.purpose) && b.value);
    return comment ? comment.value! : undefined;
  }, [props.annotation]);

  return label ? (
    <div className="bg-white p-2 shadow-md rounded-md z-30">
      {label}
    </div>
  ) : null;

}