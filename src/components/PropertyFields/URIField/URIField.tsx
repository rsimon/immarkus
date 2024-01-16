import { ChangeEvent, useState } from 'react';
import { Pen } from 'lucide-react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { BasePropertyField } from '../BasePropertyField';
import { cn } from '@/ui/utils';
import { useValidation } from '../PropertyValidation';

interface URIFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: string;

  onChange?(value: string): void;

}

export const URIField = (props: URIFieldProps) => {

  const { id, definition } = props;

  const [editable, setEditable] = useState(false);

  const value = props.onChange ? props.value || '' : props.value;

  const { showErrors, isValid } = useValidation((str: string) => {
    if (!str)
      return true;

    let url: URL;
  
    try {
      url = new URL(str);
    } catch (_) {
      return false;  
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
  }, [value]);

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement>) => props.onChange(evt.target.value) 
    : undefined;

  const error = showErrors && value && !isValid && 'must be a URI';

  const className = cn(props.className, (error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      error={error}>

      {editable ? (
        <Input
          autoFocus
          id={id} 
          className={className} 
          value={value} 
          onChange={onChange} 
          onBlur={() => setEditable(false)} />
      ) : (
        <div className={cn('flex h-9 w-full overflow-hidden shadow-sm bg-muted rounded-md border border-input pl-2.5 pr-1 items-center', props.className)}>
          <a 
            href={value} 
            className="flex-grow text-sky-700 hover:underline overflow-hidden text-ellipsis pr-1"
            target="_blank">{value}</a>

          <button 
            onClick={() => setEditable(true)}
            className="rounded-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground">
            <Pen
              className="w-5.5 h-5.5 p-1 text-muted-foreground hover:text-black" />
          </button>
        </div>
      )}
    </BasePropertyField>
  )

}