import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface TextPropertyFieldProps {

  id: string;

  definition: PropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const TextPropertyField = (props: TextPropertyFieldProps) => {

  const { id, definition, value, validate, onChange } = props;

  const isValid = !(validate && definition.required && !value);

  return (
    <div className="mb-5">
      <Label
        htmlFor={id}
        className="text-xs block mt-3 mb-1.5">
        {definition.name}
      </Label> {!isValid && (<span className="text-xs text-red-600 ml-1">required</span>)}

      <Input 
        id={id} 
        className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
        value={value || ''} 
        onChange={evt => onChange(evt.target.value)} />
    </div>
  )

}