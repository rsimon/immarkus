import { ChangeEvent } from 'react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { BasePropertyField } from '../BasePropertyField';
import { PropertyTypeIcon } from '../PropertyTypeIcon';

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

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement>) => props.onChange(evt.target.value) 
    : undefined;

  const isValid = !(validate && definition.required && !value);

  return (
    <BasePropertyField 
      id={id}
      definition={definition}
      error={!isValid && 'required'}>

      <Input 
        id={id} 
        className={isValid ? "mt-0.5" : "mt-0.5 border-red-500"} 
        value={value} 
        onChange={onChange} />

    </BasePropertyField>
  )

}