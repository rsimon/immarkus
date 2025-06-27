import { useEffect, useState } from 'react';
import { ServiceConfig, ServiceConfigStringParameter } from '@/services/Types';
import { Input } from '@/ui/Input';
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

  service: ServiceConfig;

  value?: string;

  onValueChanged(value?: string): void;

}

export const StringParameterControl =  (props:StringParameterControlProps) => {

  const { param, value, service } = props;

  const key = `immarkus:services:${service.id}:${param.id}`;

  const [initialized, setInitialized] = useState(!param.persist);

  useEffect(() => {
    if (!param.persist) return;

    // If there's no value on mount, try loading from localStorage
    const stored = localStorage.getItem(key);
    if (stored)
      props.onValueChanged(stored);

    setInitialized(true);
  }, [key]);
  
  const onChange = (value: string) => {
    console.log('onchange', key, value)
    if (param.persist) {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    }

    props.onValueChanged(value);
  }

  return initialized ? (
    <fieldset className="space-y-2">
      <Label className="font-semibold">{param.displayName}</Label>

      {param.options ? (
        <Select 
          value={value || ''}
          onValueChange={onChange}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {param.options.map(([key, value]) => (
              <SelectItem 
                key={key}
                value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          autoComplete="off"
          className="w-full my-2"
          value={value || ''} 
          onChange={evt => onChange(evt.target.value)} />
      )}
    </fieldset>
  ) : null;

}