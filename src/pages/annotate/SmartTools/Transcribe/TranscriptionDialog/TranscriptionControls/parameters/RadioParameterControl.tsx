import { ServiceConfigRadioParameter } from '@/services';
import { Label } from '@/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/ui/RadioGroup';

interface RadioParameterControlProps {

  param: ServiceConfigRadioParameter;

  value?: string;

  onValueChanged(value?: string): void;

}

export const RadioParameterControl = (props: RadioParameterControlProps) => {

  const { param, value, onValueChanged } = props;

  return (
    <fieldset className="space-y-2">
      <Label className="font-semibold">{param.displayName}</Label>

      <RadioGroup
        className="mt-2 pl-1 space-y-1"
        value={value || param.options[0][0]} 
        onValueChange={onValueChanged}>
        {param.options.map(([id, label]) => (
          <div 
            key={id}
            className="flex items-center gap-2.5">
            <RadioGroupItem
              value={id}
              id={id} />

            <Label htmlFor={id}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  )

}