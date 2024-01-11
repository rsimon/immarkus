import { ChangeEvent, useEffect } from 'react';
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

  const value = props.onChange ? props.value || '' : props.value;

  const { showErrors, isValid, setIsValid } = useValidation((str: string) => {
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

  const error = definition.required && !value ? 
    'required' : !isValid && 'must be a URI';

  const className = cn(props.className, (showErrors && !isValid ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      error={error}>

      <Input 
        id={id} 
        className={className} 
        value={value} 
        onChange={onChange} />

    </BasePropertyField>
  )

}