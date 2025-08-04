import TextareaAutosize from 'react-textarea-autosize';
import { TextPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { BasePropertyField } from '../BasePropertyField';
import { removeEmpty } from '../removeEmpty';

interface TextFieldProps {

  id: string;

  className?: string;

  definition: TextPropertyDefinition;

  value?: string | string[];

  onChange?(value: string | string[]): void;

}

export const TextField = (props: TextFieldProps) => {

  const { id, definition } = props;

  const value = props.onChange ? props.value || '' : props.value;

  const onChange = (value: string | string[]) => {
    if (props.onChange) {
      const normalized = removeEmpty(value);
      props.onChange(normalized);
    }
  }

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      value={value}
      onChange={onChange}
      render={(value, onChange) => definition.size === 'L' ? (
        <TextareaAutosize 
          id={id} 
          cacheMeasurements
          minRows={4}
          maxRows={20}
          className={cn('shadow-xs w-full outline-black rounded-md bg-muted border border-input p-2 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', props.className)} 
          value={props.onChange ? value || '' : value} 
          onChange={evt => props.onChange && onChange(evt.target.value)} />
      ) : (
        <Input 
          id={id} 
          className={cn(props.className, 'mt-0.5')} 
          value={props.onChange ? value || '' : value} 
          onChange={evt => props.onChange && onChange(evt.target.value)} />
      )} />
  )

}