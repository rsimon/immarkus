import { useEffect, useState } from 'react';
import { CopyPlus } from 'lucide-react';
import { TextPropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InfoTooltip } from '../InfoTooltip';
import { InheritedFrom } from '../InheritedFrom';
import { TextFieldInput } from './TextFieldInput';
import { removeEmpty } from '../removeEmpty';

interface TextFieldProps {

  id: string;
    
  className?: string;

  definition: TextPropertyDefinition;

  value: string | string[];

  onChange?(value?: string | (string | undefined)[]): void;

}

export const TextField = (props: TextFieldProps) => {

  const { definition } = props;

  const [values, setValues] = useState<(string | undefined)[]>(Array.isArray(props.value) ? props.value : [props.value]);
    
  const onChange = (idx: number, updated: string) =>
    setValues(current => current.map((v, i) => i === idx ? updated : v));

  const onAppendField = () =>
    setValues(current => [...current, undefined]);

  useEffect(() => {
    if (props.onChange) {
      const normalized = removeEmpty(values);
      if (normalized)
        props.onChange(normalized);
    }
  }, [values]);

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between pr-1 mb-1.5">
        <div className="flex items-center gap-0.5">
          <Label
            htmlFor={props.id}
            className="text-sm inline-block ml-0.5 ">
            {definition.name}
          </Label>

          {definition.description && (
            <InfoTooltip description={definition.description} />
          )}
        </div>
        
        <InheritedFrom definition={definition} />
      </div>

      <div className="flex flex-col gap-2 justify-end">
        {values.map((value, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <TextFieldInput
              className={props.className}
              definition={definition}
              isLast={idx === values.length - 1}
              value={value}
              onAppendField={onAppendField}
              onChange={value => onChange(idx, value)} />
          </div>
        ))}

        {props.definition.multiple && !(props.definition.size === 'L') && (
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