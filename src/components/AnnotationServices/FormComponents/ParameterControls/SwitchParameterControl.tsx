import { useTranslation } from 'react-i18next';
import { ServiceConfigSwitchParameter } from '@/services/Types';
import { Label } from '@/ui/Label';
import { Switch } from '@/ui/Switch';

interface SwitchParameterControlProps {

  param: ServiceConfigSwitchParameter;

  connectorId: string;

  checked?: boolean;

  onCheckedChange(pressed: boolean): void;

}

export const SwitchParameterControl =  (props:SwitchParameterControlProps) => {

  const { connectorId, param, checked, onCheckedChange } = props;

  const { t } = useTranslation('services');

  return (
    <fieldset>
      <div className="flex gap-3 items-start mt-3">
        <Switch
          id="merge-lines"
          className="mt-1"
          checked={Boolean(checked)}
          onCheckedChange={onCheckedChange} />

        <div className="leading-relaxed">
          <Label htmlFor="merge-lines">{t(`${connectorId}.params.${param.id}.displayName`, { defaultValue: param.displayName })}</Label>
          <p className="text-sm text-muted-foreground pr-4">
            {t(`${connectorId}.params.${param.id}.hint`, { defaultValue: param.hint })}
          </p>
        </div>
      </div>
    </fieldset>
  )

}