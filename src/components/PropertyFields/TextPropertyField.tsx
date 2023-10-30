import { TextProperty } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface TextPropertyFieldProps {

  id: string;

  property: TextProperty;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const TextPropertyField = (props: TextPropertyFieldProps) => {

  const { id, property, value, validate, onChange } = props;

  const isValid = !(validate && property.required && !value);

  return (
    <>
      <Label 
        htmlFor={id}
        className="text-xs block mb-1 mt-3">
        {property.name}
      </Label> {!isValid && (<span className="text-xs text-red-600 ml-1">required</span>)})

      <Input 
        id={id} 
        className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
        value={value} 
        onChange={evt => onChange(evt.target.value)} />
    </>
  )

}