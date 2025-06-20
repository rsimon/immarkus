import { useEffect } from 'react';
import { ServiceConfigApiKeyParameter } from '@/services';
import { deobfuscate, obfuscate } from '@/utils/obfuscateString';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface APIKeyParameterControlProps {

  param: ServiceConfigApiKeyParameter;

  serviceId: string;

  value?: string;

  onValueChanged(value?: string): void;

}

export const APIKeyParameterControl = (props: APIKeyParameterControlProps) => {

  const { param, serviceId, value } = props;

  const key = `immarkus:services:${serviceId}:${param.id}`;

  useEffect(() => {
    // If there's no value on mount, try loading from localStorage
    const stored = localStorage.getItem(key);
    if (stored)
      props.onValueChanged(deobfuscate(stored));
  }, []);

  const onChange = (value: string) => {
    if (value) {
      localStorage.setItem(key, obfuscate(value));
      props.onValueChanged(value);
    } else {
      localStorage.removeItem(key);
      props.onValueChanged(undefined);
    }
  }

  return (
    <fieldset className="space-y-2">
      <Label className="font-semibold">{param.displayName}</Label>

      <Input
        autoComplete="off"
        className="w-full mt-2" 
        type="password" 
        value={value || ''} 
        onChange={evt => onChange(evt.target.value)} />
    </fieldset>
  )

}