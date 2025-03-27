import { CSSProperties, useMemo } from 'react';
import chroma from 'chroma-js';
import { cn } from '@/ui/utils';
import { Input } from '@/ui/Input';
import { getBrightness, isValidColor } from '@/utils/color';
import { useColorSampling } from './useColorSampling';
import { ColorFieldInputToggle } from './ColorFieldInputToggle';
import { PickerCursor } from './PickerCursor';

interface ColorFieldInputProps {

  className?: string;

  value: string;

  onChange(value?: string): void;

}

export const ColorFieldInput = (props: ColorFieldInputProps) => {

  const className = cn(props.className, 'text-center');

  const value = props.onChange ? props.value || '' : props.value;

  const { startSampling, stopSampling, isSampling } = useColorSampling(props.onChange);

  const style: CSSProperties = useMemo(() => {
    if (!isValidColor(value)) return;

    const backgroundColor = value;
    const borderColor = chroma(value).darken().hex();
    const color = getBrightness(value) > 0.5 ? chroma(value).darken(3).hex() : '#ffffff';

    return { backgroundColor, borderColor, color };
  }, [value]);

  const onToggle = (pressed: boolean) => {
    if (pressed)
      startSampling();
    else 
      stopSampling();
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        {false ? (
          <div 
            className="h-9 bg-transparent text-muted-foreground rounded-md items-center text-sm flex justify-center border border-input border-dashed"
            style={{ backgroundColor: value }}>
            Pick a color...
          </div>
        ) : ( 
          <Input 
            className={className}
            style={style}
            value={props.onChange ? value || '' : value} 
            onChange={evt => props.onChange && props.onChange(evt.target.value)} />
        )}
      </div>

      <div className="absolute right-1 top-0 h-full flex items-center"> 
        <ColorFieldInputToggle
          colorValue={value}
          pressed={isSampling}
          onPressedChange={onToggle} />
      </div>

      {isSampling && (
        <PickerCursor />
      )}
    </div>
  )

}