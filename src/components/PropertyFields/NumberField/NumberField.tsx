import { useEffect, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { BasePropertyField } from '../BasePropertyField';
import { useValidation } from '../PropertyValidation';
import { cn } from '@/ui/utils';

interface NumberFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: number;

  onChange?(value: number): void;

}

export const NumberField = (props: NumberFieldProps) => {

  const { id, definition } = props;

  const [value, setValue] = useState(props.value ? props.value.toString() : '');

  const { showErrors, isValid } = useValidation((str: string) => {
    return !str || !isNaN(parseFloat(str));
  }, [value]);

  useEffect(() => {
    const num = parseFloat(value);

    if (!isNaN(num))
      props.onChange && props.onChange(num);
  }, [value]);

  const error = (showErrors && !isValid) 
    ? value ? 'must be a number' : 'required' : '';

  const className = cn(props.className, (error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      error={error}>

      <Input 
        id={id} 
        className={className} 
        value={value} 
        onChange={evt => setValue(evt.target.value)} />
    </BasePropertyField>
  )

}