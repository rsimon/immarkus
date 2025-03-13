import { useState, ReactNode, useEffect } from 'react';
import { CopyPlus } from 'lucide-react';
import { PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InfoTooltip } from './InfoTooltip';
import { InheritedFrom } from './InheritedFrom';

interface BasePropertyFieldProps <T extends unknown> {

  id: string;

  definition: PropertyDefinition;

  error?: string;

  render(value: T | undefined, onChange: (value?: T) => void, index: number): ReactNode;

  value: T | T[];

  onChange?(value?: T | (T | undefined)[]): void;

  onAppendField?(index: number): void;

}

export const BasePropertyField = <T extends unknown>(props: BasePropertyFieldProps<T>) => {

  const { definition } = props;

  const [values, setValues] = useState<(T | undefined)[]>(Array.isArray(props.value) ? props.value : [props.value]);

  const onChange = (idx: number) => (updated: T) =>
    setValues(current => current.map((v, i) => i === idx ? updated : v));

  const onAppendField = () => {
    setValues(current => [...current, undefined]);

    if (props.onAppendField)
      props.onAppendField(values.length);
  }

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
          <div key={idx} className="flex items-center gap-1">
            {props.render(value, onChange(idx), idx)}
          </div>
        ))} 

        {props.definition.multiple && (
          <button 
            className="self-end flex gap-1 items-center text-xs text-muted-foreground mt-0.5 mr-0.5"
            onClick={onAppendField}
            type="button">
            <CopyPlus className="h-3.5 w-3.5 mb-0.5 mr-0.5" /> Add value
          </button>
        )}
      </div>
    </div>
  )

}