import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { InheritedFrom } from '../InheritedFrom';

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

  return (
    <div className="mb-5">
      <div className="flex justify-between pr-1.5">
        <div>
          <Label 
            htmlFor={id}
            className="text-xs block mt-3 mb-1.5 ml-0.5">
            {definition.name} 
          </Label> {definition.required && !value ? (
            <span className="text-xs text-red-600 ml-1">required</span>
          ) : !isValid && (
            <span className="text-xs text-red-600 ml-1">must be a number</span>
          )}
        </div>

        <InheritedFrom definition={definition} />
      </div>

      <Input 
        id={id} 
        className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
        value={value || ''} 
        onChange={evt => onChange(parseFloat(evt.target.value))} />
    </div>
  )

}