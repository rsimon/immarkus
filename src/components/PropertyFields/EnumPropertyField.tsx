import { EnumPropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface EnumPropertyFieldProps {

  id: string;

  definition: EnumPropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const EnumPropertyField = (props: EnumPropertyFieldProps) => {

  const { id, definition, value, validate, onChange } = props;

  const isValid = !validate || !definition.required || value;

  return (
    <div className="mb-5">
      <Label 
        htmlFor={id}
        className="text-xs block mt-3 mb-1.5">
        {definition.name}
      </Label> {!isValid && (<span className="text-xs text-red-600 ml-1">required</span>)}

      <Select 
        value={value}
        onValueChange={props.onChange}>
        
        <SelectTrigger className="w-full h-8 mt-0.5">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={null}>&nbsp;</SelectItem>

          {definition.values.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

}