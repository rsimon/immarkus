import { EnumPropertyDefinition } from '@/model';
import { BasePropertyField } from '../BasePropertyField';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';
import { cn } from '@/ui/utils';

interface EnumFieldProps {

  id: string;

  className?: string;

  definition: EnumPropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const EnumField = (props: EnumFieldProps) => {

  const { id, definition, value, validate, onChange } = props;

  const isValid = !validate || !definition.required || value;

  const error = !isValid && 'required';

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      error={error}>

      <Select 
        value={value}
        onValueChange={props.onChange}>
        
        <SelectTrigger className={cn(props.className, 'w-full mt-0.5')}>
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={null}>&nbsp;</SelectItem>

          {(definition.values || []).map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>

    </BasePropertyField>
  )

}