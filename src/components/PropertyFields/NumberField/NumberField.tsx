import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { InheritedFrom } from '../InheritedFrom';
import { BasePropertyField } from '../BasePropertyField';

interface NumberFieldProps {

  id: string;

  definition: PropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: number): void;

}

export const NumberField = (props: NumberFieldProps) => {

  const { id, definition, value, validate, onChange } = props;

  const isValid = !validate || !isNaN(parseFloat(value));

  const error = definition.required && !value ?
    'required' : !isValid && 'must be a number';

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      error={error}>

      <Input 
        id={id} 
        className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
        value={value || ''} 
        onChange={evt => onChange(parseFloat(evt.target.value))} />
        
    </BasePropertyField>
  )

}