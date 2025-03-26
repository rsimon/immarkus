import chroma from 'chroma-js';
import { Pipette } from 'lucide-react';
import { cn } from '@/ui/utils';
import { Input } from '@/ui/Input';
import { useColorSampling } from './useColorSampling';
import { getBrightness, isValidColor } from '@/utils/color';
import { CSSProperties, useMemo } from 'react';
import { Toggle } from '@/ui/Toggle';

interface ColorFieldInputProps {

  className?: string;

  value: string;

  onChange(value?: string): void;

}

export const ColorFieldInput = (props: ColorFieldInputProps) => {

  const className = cn(props.className, 'mt-0.5 text-center');

  const value = props.onChange ? props.value || '' : props.value;

  const { toggleSampling, isSampling } = useColorSampling(props.onChange);

  const style: CSSProperties = useMemo(() => {
    if (!isValidColor(value)) return;

    const backgroundColor = value;
    const borderColor = chroma(value).darken().hex();
    const color = getBrightness(value) > 0.5 ? chroma(value).darken(3).hex() : '#ffffff';

    return { backgroundColor, borderColor, color };
  }, [value]);

  return (
    <div className="relative w-full">
      <div className="relative">
        {isSampling ? (
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

      <div className="absolute right-1 top-0.5 bottom-0 flex items-center"> 
        <Toggle
          type="button"
          className={cn('h-auto w-auto p-1 rounded hover:bg-black/10')}
          style={{
            backgroundColor: (isSampling && value)
              ? chroma(value).darken(2).hex() : undefined
          }}
          onClick={toggleSampling}>
          <Pipette
            style={{
              color: (isSampling && value) ? '#fff' : style.color
            }}
            className={cn('w-5.5 h-5.5 p-1', !isSampling && 'hover:text-black')} />
        </Toggle>
      </div>
    </div>
  )

}