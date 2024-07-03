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

  value?: number | number[];

  onChange?(value?: number | number[]): void;

}

// Helper
const toString = (value: number | number[]) => {
  if (!value) return '';

  if (Array.isArray(value))
    return value.map(num => num.toString());
  else
    return value.toString();
}

export const NumberField = (props: NumberFieldProps) => {

  const { id, definition } = props;

  const [value, setValue] = useState<string | string[]>(toString(props.value));

  const { showErrors, isValid } = useValidation((str: string | string[]) => {
    if (Array.isArray(str)) {
      const nonEmpty = str.filter(Boolean);
      return nonEmpty.length === 0 || !nonEmpty.some(s => isNaN(parseFloat(s)));
    } else {
      return !str || !isNaN(parseFloat(str));
    }
  }, [value]);

  useEffect(() => {
    if (!props.onChange) return;

    const values = Array.isArray(value) ? value : [value];

    const numbers = values.filter(Boolean).map(parseFloat);

    if (!numbers.some(isNaN)) {
      if (numbers.length > 1)
        props.onChange(numbers);
      else
        props.onChange(numbers[0]);
    } else {
      props.onChange();
    }
  }, [value]);

  const error = (showErrors && !isValid) 
    ? value ? 'must be a number' : 'required' : '';

  const className = cn(props.className, (error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  return (
    <BasePropertyField<string>
      id={id}
      definition={definition}
      error={error}
      value={value}
      onChange={setValue}
      render={(value, onChange) => (
        <Input 
          id={id} 
          className={className} 
          value={value || ''} 
          onChange={evt => onChange(evt.target.value)} />
      )} />
  )

}