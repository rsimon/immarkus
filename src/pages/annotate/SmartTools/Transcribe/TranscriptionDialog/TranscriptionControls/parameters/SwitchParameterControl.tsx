import { ServiceConfigSwitchParameter } from '@/services/Types';
import { Label } from '@/ui/Label';
import { Switch } from '@/ui/Switch';

interface SwitchParameterControlProps {

  param: ServiceConfigSwitchParameter;

  checked?: boolean;

  onCheckedChange(pressed: boolean): void;

}

export const SwitchParameterControl =  (props:SwitchParameterControlProps) => {

  const { param, checked, onCheckedChange } = props;

  return (
    <fieldset>
      <div className="flex gap-3 items-start mt-3">
        <Switch 
          id="merge-lines" 
          className="mt-1" 
          checked={Boolean(checked)} 
          onCheckedChange={onCheckedChange} />

        <div className="leading-relaxed">
          <Label htmlFor="merge-lines">{param.displayName}</Label>
          <p className="text-sm text-muted-foreground pr-4">
            {param.hint}
          </p>
        </div>
      </div>
    </fieldset>
  )

}