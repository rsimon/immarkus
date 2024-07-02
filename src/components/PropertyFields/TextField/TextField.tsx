import { TextPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Textarea } from '@/ui/Textarea';
import { cn } from '@/ui/utils';
import { BasePropertyField } from '../BasePropertyField';

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

  const className = cn(props.className,'mt-0.5');

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      value={value}
      onChange={props.onChange}
      render={(value, onChange) => definition.size === 'L' ? (
        <Textarea 
          id={id} 
          className={className} 
          value={props.onChange ? value || '' : value} 
          onChange={evt => props.onChange && onChange(evt.target.value)} />
      ) : (
        <Input 
          id={id} 
          className={className} 
          value={props.onChange ? value || '' : value} 
          onChange={evt => props.onChange && onChange(evt.target.value)} />
      )} />
  )

}