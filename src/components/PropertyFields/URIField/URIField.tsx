import { ChangeEvent } from 'react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { BasePropertyField } from '../BasePropertyField';

interface URIFieldProps {

  id: string;

  definition: PropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const URIField = (props: URIFieldProps) => {

  const { id, definition, validate } = props;

  const value = props.onChange ? props.value || '' : props.value;

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement>) => props.onChange(evt.target.value) 
    : undefined;

  const isValidURL = (str: string) => {
    let url: URL;
  
    try {
      url = new URL(str);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  const isValid = !validate || isValidURL(value);

  const error = definition.required && !value ? 
    'required' : !isValid && 'msut be a URI';

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      error={error}>

      <Input 
        id={id} 
        className={isValid ? "mt-0.5" : "mt-0.5 border-red-500"} 
        value={value} 
        onChange={onChange} />

    </BasePropertyField>
  )

}