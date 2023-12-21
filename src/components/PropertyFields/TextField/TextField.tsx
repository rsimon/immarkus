import { ChangeEvent } from 'react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface TextFieldProps {

  id: string;

  definition: PropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const TextField = (props: TextFieldProps) => {

  const { id, definition, validate } = props;

  const value = props.onChange ? props.value || '' : props.value;
  
  const isValid = !(validate && definition.required && !value);

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement>) => props.onChange(evt.target.value) 
    : undefined;

  return (
    <div className="mb-5">
      <Label
        htmlFor={id}
        className="text-xs block mt-3 mb-1.5 ml-0.5">
        {definition.name}
      </Label> {!isValid && (<span className="text-xs text-red-600 ml-1">required</span>)}

      <Input 
        id={id} 
        className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
        value={value} 
        onChange={onChange} />
    </div>
  )

}