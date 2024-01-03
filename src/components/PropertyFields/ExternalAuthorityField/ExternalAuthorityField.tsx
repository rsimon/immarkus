import { ChangeEvent, useRef } from 'react';
import { ExternalAuthorityPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { ExternalAuthoritySelector } from './ExternalAuthoritySelector';
import { InheritedFrom } from '../InheritedFrom';

interface ExternalAuthorityFieldProps {

  id: string;

  definition: ExternalAuthorityPropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const ExternalAuthorityField = (props: ExternalAuthorityFieldProps) => {

  const { id, definition, validate } = props;

  const input = useRef<HTMLInputElement>();

  const value = props.onChange ? props.value || '' : props.value;
  
  const isValid = !(validate && definition.required && !value);

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement>) => props.onChange(evt.target.value) 
    : undefined;

  const onCloseDialog = () =>
    setTimeout(() => input.current.focus(), 1);

  return (
    <div className="mb-6">
      <div className="ml-0.5 mr-0.5 flex justify-between items-center">
        <div className="flex-shrink-0">
          <Label htmlFor={id} className="text-xs text-muted-foreground">
            {definition.name}
            {!isValid && (<span className="text-xs text-red-600 ml-1">required</span>)}
          </Label> 
        </div> 
          
        <div className="pr-1 flex text-muted-foreground">
          <ExternalAuthoritySelector 
            definition={props.definition} 
            onCloseDialog={onCloseDialog} />  

          <div className="flex relative -top-[1px]">
          <InheritedFrom definition={definition} />
          </div>
        </div> 
      </div> 

      <Input
        ref={input}
        id={id} 
        className={isValid ? "mt-0.5" : "mt-0.5 border-red-500"} 
        value={value} 
        onChange={onChange} />
    </div>
  )

}