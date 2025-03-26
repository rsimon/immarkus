import { Pipette } from 'lucide-react';
import { cn } from '@/ui/utils';
import { Input } from '@/ui/Input';
import { useColorSampling } from './useColorSampling';

interface ColorFieldInputProps {

  className?: string;

  value: string;

  onChange(value?: string): void;

}

export const ColorFieldInput = (props: ColorFieldInputProps) => {

  const className = cn(props.className, 'mt-0.5');

  const value = props.onChange ? props.value || '' : props.value;

  const { toggleSampling, isSampling } = useColorSampling(props.onChange);

  return (
    <div className="relative w-full">
      <div className="relative">
        {isSampling ? (
          <div>Sample!</div>
        ) : ( 
          <Input 
            className={className} 
            value={props.onChange ? value || '' : value} 
            onChange={evt => props.onChange && props.onChange(evt.target.value)} />
        )}
      </div>

      <div className="absolute right-2 top-0 bottom-0 flex items-center"> 
        <button
          type="button"
          className="rounded-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground"
          onClick={toggleSampling}>
          <Pipette
            className="w-5.5 h-5.5 p-1 text-muted-foreground hover:text-black" />
        </button>
      </div>
    </div>
  )

}