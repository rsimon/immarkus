import { EnumProperty } from '@/model';
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

  property: EnumProperty;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const EnumPropertyField = (props: EnumPropertyFieldProps) => {

  const { id, property, value, validate, onChange } = props;

  const isValid = !validate || !property.required || value;

  return (
    <div className="mb-5">
      <Label 
        htmlFor={id}
        className="text-xs block mt-3 mb-1.5">
        {property.name}
      </Label> {!isValid && (<span className="text-xs text-red-600 ml-1">required</span>)}

      <Select 
        value={value}
        onValueChange={props.onChange}>
        
        <SelectTrigger className="w-full h-8 mt-0.5">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={null}>&nbsp;</SelectItem>

          {property.values.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

}