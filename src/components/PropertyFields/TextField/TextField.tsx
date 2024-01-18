import { ChangeEvent } from 'react';
import { TextPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Textarea } from '@/ui/Textarea';
import { cn } from '@/ui/utils';
import { BasePropertyField } from '../BasePropertyField';

interface TextFieldProps {

  id: string;

  className?: string;

  definition: TextPropertyDefinition;

  value?: string;

  onChange?(value: string): void;

}

export const TextField = (props: TextFieldProps) => {

  const { id, definition } = props;

  const value = props.onChange ? props.value || '' : props.value;

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => props.onChange(evt.target.value) 
    : undefined;

  const className = cn(props.className,'mt-0.5');

  return (
    <BasePropertyField 
      id={id}
      definition={definition}>

      {definition.size === 'L' ? (
        <Textarea 
          id={id} 
          className={className} 
          value={value} 
          onChange={onChange} />
      ) : (
        <Input 
          id={id} 
          className={className} 
          value={value} 
          onChange={onChange} />
      )}
    </BasePropertyField>
  )

}