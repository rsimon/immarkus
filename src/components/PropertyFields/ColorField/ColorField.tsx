import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { BasePropertyField } from '../BasePropertyField';
import { removeEmpty } from '../removeEmpty';
import { Pipette } from 'lucide-react';

interface ColorFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: string | string[];

  onChange?(value: string | string[]): void;

}

export const ColorField = (props: ColorFieldProps) => {

  const { id, definition } = props;

  const value = props.onChange ? props.value || '' : props.value;

  const className = cn(props.className, 'mt-0.5');

  const onChange = (value: string | string[]) => {
    if (props.onChange) {
      const normalized = removeEmpty(value);
      props.onChange(normalized);
    }
  }

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      value={value}
      onChange={onChange}
      render={(value, onChange) => (
        <div className="relative w-full">
          <Input 
            id={id} 
            className={className} 
            value={props.onChange ? value || '' : value} 
            onChange={evt => props.onChange && onChange(evt.target.value)} />

          <div className="absolute right-2 top-0 bottom-0 flex items-center"> 
            <button
              type="button"
              className="rounded-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground">
              <Pipette
                className="w-5.5 h-5.5 p-1 text-muted-foreground hover:text-black" />
            </button>
          </div>
        </div>
      )} />
  )

}