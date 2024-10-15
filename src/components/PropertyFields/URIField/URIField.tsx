import { useState } from 'react';
import { Pen } from 'lucide-react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { BasePropertyField } from '../BasePropertyField';
import { cn } from '@/ui/utils';
import { useValidation } from '../PropertyValidation';
import { removeEmpty } from '../removeEmpty';

interface URIFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: string | string[];

  onChange?(value: string | string[]): void;

}

export const URIField = (props: URIFieldProps) => {

  const { id, definition } = props;

  const [editable, _setEditable] = useState<Set<number>>(new Set([]));

  const { showErrors, isValid } = useValidation((val: string | string[]) => {
    if (!val) return true;

    const isValidURL = (str: string) => {
      let url: URL;
  
      try {
        url = new URL(str);
      } catch (_) {
        return false;  
      }

      return true;
    }
    
    if (Array.isArray(val)) {
      const nonEmpty = val.filter(Boolean);
      return nonEmpty.every(isValidURL);
    } else {
      return isValidURL(val);
    }
  }, [props.value]);

  const error = showErrors && props.value && !isValid && 'must be a URI';

  const className = cn(props.className, (error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  const setEditable = (index: number, editable: boolean) => {
    if (editable)
      _setEditable(current => new Set([...current, index]));
    else
      _setEditable(current => new Set([...current].filter(n => n !== index)))
  }

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
      error={error}
      value={props.value}
      onChange={onChange}
      onAppendField={index => setEditable(index, true)}
      render={(value, onChange, index) => editable.has(index) ? (
        <Input
          autoFocus
          className={className} 
          value={value || ''} 
          onChange={evt => onChange(evt.target.value)} 
          onBlur={() => setEditable(index, false)} />
      ) : (
        <div className={cn('flex h-9 w-full overflow-hidden shadow-sm bg-muted rounded-md border border-input pl-2.5 pr-1 items-center', props.className)}>
          <a 
            href={value} 
            className="flex-grow text-sky-700 hover:underline whitespace-nowrap overflow-hidden text-ellipsis pr-1"
            target="_blank">{value}</a>

          <button 
            onClick={() => setEditable(index, true)}
            type="button"
            className="rounded-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground">
            <Pen
              className="w-5.5 h-5.5 p-1 text-muted-foreground hover:text-black" />
          </button>
        </div>
      )} />
  )

}