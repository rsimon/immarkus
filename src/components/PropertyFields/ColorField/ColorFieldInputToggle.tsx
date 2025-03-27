import { Pipette } from 'lucide-react';
import { Toggle } from '@/ui/Toggle';

interface ColorFieldInputToggleProps {

  colorValue?: string;

  pressed: boolean;

  onPressedChange(pressed: boolean): void;

}

export const ColorFieldInputToggle = (props: ColorFieldInputToggleProps) => {

  return (
    <Toggle
      type="button"
      className="h-7 rounded"
      pressed={props.pressed}
      onPressedChange={props.onPressedChange}>
      <Pipette className="size-4" />
    </Toggle>
  )

}