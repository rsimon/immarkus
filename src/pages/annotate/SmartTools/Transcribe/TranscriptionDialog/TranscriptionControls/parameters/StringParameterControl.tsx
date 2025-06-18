import { ServiceConfigStringParameter } from '@/services/Types';
import { Label } from '@/ui/Label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
   SelectValue 
} from '@/ui/Select';

interface StringParameterControlProps {

  param: ServiceConfigStringParameter;

  value?: string;

  onValueChanged(value?: string): void;

}

export const StringParameterControl =  (props:StringParameterControlProps) => {

  const { param, value, onValueChanged } = props;

  return (
    <fieldset className="space-y-2">
      <Label className="font-semibold">{param.displayName}</Label>

      {param.options ? (
        <Select 
          value={value || ''}
          onValueChange={onValueChanged}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {Object.keys(param.options).map(key => (
              <SelectItem 
                key={key}
                value={key}>
                {param.options[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </fieldset>
  )

}