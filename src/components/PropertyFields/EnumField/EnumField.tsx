import { EnumPropertyDefinition } from '@/model';
import { cn } from '@/ui/utils';
import { BasePropertyField } from '../BasePropertyField';
import { removeEmpty } from '../removeEmpty';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface EnumFieldProps {

  id: string;

  className?: string;

  definition: EnumPropertyDefinition;

  value?: string;

  onChange?(value: string | string[]): void;

}

export const EnumField = (props: EnumFieldProps) => {

  const { id, definition, value } = props;

  const onChange = (value: string | string[]) => {
    if (props.onChange) {
      const normalized = removeEmpty(value);
      props.onChange(normalized);
    }
  }

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      value={value}
      onChange={onChange}
      render={(value, onChange) => (
        <Select 
          value={value}
          onValueChange={onChange}>
          
          <SelectTrigger className={cn(props.className, 'w-full mt-0.5')}>
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="max-h-96">
            <SelectItem value={null}>&nbsp;</SelectItem>

            {(definition.values || []).map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )} />
  )

}