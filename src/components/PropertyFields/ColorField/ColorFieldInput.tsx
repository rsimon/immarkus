import { CSSProperties, useEffect, useMemo } from 'react';
import chroma from 'chroma-js';
import { X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { getBrightness, isValidColor } from '@/utils/color';
import { useColorSampling } from './useColorSampling';
import { ColorFieldInputToggle } from './ColorFieldInputToggle';

interface ColorFieldInputProps {

  className?: string;

  value: string;

  onChange(value?: string): void;

  onSample(isSampling: boolean): void;

}

export const ColorFieldInput = (props: ColorFieldInputProps) => {

  const className = cn(props.className, 'text-center');

  const value = props.onChange ? props.value || '' : props.value;

  const brightness = useMemo(() => value ? getBrightness(value) : 1, [value]);

  const { startSampling, stopSampling, isSampling } = useColorSampling(props.onChange);

  const style: CSSProperties = useMemo(() => {
    if (!isValidColor(value)) return;

    const backgroundColor = value;
    const borderColor = chroma(value).darken().hex();
    const color = getBrightness(value) > 0.5 ? chroma(value).darken(3).hex() : '#ffffff';

    return { backgroundColor, borderColor, color };
  }, [value]);

  useEffect(() => props.onSample(isSampling), [isSampling]);

  const onToggle = (pressed: boolean) => {
    if (pressed)
      startSampling();
    else
      stopSampling();
  }

  const onClear = () => {
    stopSampling();
    props.onChange && props.onChange(undefined);
  }

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

      <div className="absolute left-1 top-0 h-full flex items-center cursor-pointer!"> 
        <ColorFieldInputToggle
          colorValue={value}
          pressed={isSampling}
          onPressedChange={onToggle} />
      </div>

      {Boolean(value) && (
        <div className="absolute right-1 top-0 h-full flex items-center"> 
          <Button
            variant="ghost"
            size="icon"
            className={cn(brightness < 0.5 && 'text-white', 'cursor-pointer! rounded p-1.5 h-auto w-auto')}
            onClick={onClear}>
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )

}