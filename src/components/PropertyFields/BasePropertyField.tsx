import { useState, ReactNode, useEffect } from 'react';
import { PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InfoTooltip } from './InfoTooltip';
import { InheritedFrom } from './InheritedFrom';
import { CirclePlus } from 'lucide-react';

interface BasePropertyFieldProps <T extends unknown> {

  id: string;

  definition: PropertyDefinition;

  error?: string;

  render(value: T | undefined, onChange: (value?: T) => void): ReactNode;

  value: T | T[];

  onChange?(value?: T | (T | undefined)[]): void;

}

export const BasePropertyField = <T extends unknown>(props: BasePropertyFieldProps<T>) => {

  const { definition } = props;

  const [values, setValues] = useState<(T | undefined)[]>(Array.isArray(props.value) ? props.value : [props.value]);

  const onChange = (idx: number) => (updated: T) => {
    setValues(current => current.map((v, i) => i === idx ? updated : v));
  }

  const onAppendField = () =>
    setValues(current => [...current, undefined]);

  useEffect(() => {
    if (props.onChange) {
      if (values.length > 1)
        props.onChange(values);
      else
        props.onChange(values[0]);
    }
  }, [values]);

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between pr-1 mb-1.5">
        <div className="flex">
          <Label
            htmlFor={props.id}
            className="text-sm inline-block ml-0.5 ">
            {definition.name}
          </Label>

          {definition.description && (
            <InfoTooltip description={definition.description} />
          )}

          {props.error && (<span className="text-xs text-red-600 ml-1">{props.error}</span>)}
        </div>
        
        <InheritedFrom definition={definition} />
      </div>

      <div className="flex flex-col gap-2 justify-end">
        {values.map((value, idx) => (
          <div key={idx}>
            {props.render(value, onChange(idx))}
          </div>
        ))} 

        {props.definition.multiple && (
          <button 
            className="flex gap-1 items-center text-xs text-muted-foreground mt-2"
            onClick={onAppendField}>
            <CirclePlus className="h-3.5 w-3.5 mb-0.5" /> Add value
          </button>
        )}
      </div>

    </div>
  )

}