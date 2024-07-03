import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { PropertyDefinition } from '@/model';
import { InheritedFrom } from '../InheritedFrom';

interface GeoCoordinatesFieldInputProps {

  className?: string;

  definition?: PropertyDefinition;

  error?: boolean;

  index: number;

  value?: [string, string];

  onChange(arg?: [string, string]): void;

}

export const GeoCoordinatesFieldInput = (props: GeoCoordinatesFieldInputProps) => {

  const [latStr, lngStr] = props.value ? props.value : ['', ''];

  const className = cn(props.className, (props.error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  return (
    <div className="flex items-center gap-2.5">
      <Input 
        className={className} 
        placeholder="Lat..."
        value={latStr} 
        onChange={evt => props.onChange([evt.target.value, lngStr])} />

      /

      <Input 
        className={className} 
        placeholder="Lng..."
        value={lngStr} 
        onChange={evt => props.onChange([latStr, evt.target.value])} />

      <InheritedFrom 
        className="mr-1"
        definition={props.definition} />
    </div>
  )

}