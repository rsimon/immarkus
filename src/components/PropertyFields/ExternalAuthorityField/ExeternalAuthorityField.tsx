import { ChangeEvent } from 'react';
import { ExternalAuthorityPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { ExternalAuthoritySelector } from './ExternalAuthoritySelector';

interface ExternalAuthorityFieldProps {

  id: string;

  definition: ExternalAuthorityPropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const ExternalAuthorityField = (props: ExternalAuthorityFieldProps) => {

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
        className="text-xs mt-3 mb-1 ml-0.5 mr-0.5 flex justify-between items-center">
        <div>
          {definition.name}
          {!isValid && (<span className="text-xs text-red-600 ml-1">required</span>)}
        </div>

        <ExternalAuthoritySelector definition={props.definition} />    
      </Label>    

      <Input 
        id={id} 
        className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
        value={value} 
        onChange={onChange} />
    </div>
  )

}