import { useMemo } from 'react';
import { Pipette } from 'lucide-react';
import { Toggle } from '@/ui/Toggle';
import { cn } from '@/ui/utils';
import { getBrightness } from '@/utils/color';

interface ColorFieldInputToggleProps {

  colorValue?: string;

  pressed: boolean;

  onPressedChange(pressed: boolean): void;

}

export const ColorFieldInputToggle = (props: ColorFieldInputToggleProps) => {

  const brightness = useMemo(() => {
    if (!props.colorValue) return 1;
    return getBrightness(props.colorValue);
  }, [props.colorValue]);

  const className = cn('h-7 rounded', brightness < 0.5 && 'text-white');

  return (
    <Toggle
      type="button"
      className={className}
      pressed={props.pressed}
      onPressedChange={props.onPressedChange}>
      <Pipette className="size-4 cursor-pointer!" />
    </Toggle>
  )

}