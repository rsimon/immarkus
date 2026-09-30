import { useTranslation } from 'react-i18next';
import { ServiceConfigRadioParameter } from '@/services';
import { Label } from '@/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/ui/RadioGroup';

interface RadioParameterControlProps {

  param: ServiceConfigRadioParameter;

  connectorId: string;

  value?: string;

  onValueChanged(value?: string): void;

}

export const RadioParameterControl = (props: RadioParameterControlProps) => {

  const { connectorId, param, value, onValueChanged } = props;

  const { t } = useTranslation('services');

  return (
    <fieldset className="space-y-2">
      <Label className="font-semibold">{t(`${connectorId}.params.${param.id}.displayName`, { defaultValue: param.displayName })}</Label>

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

            <Label htmlFor={id}>{t(`${connectorId}.params.${param.id}.options.${id}`, { defaultValue: label })}</Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  )

}