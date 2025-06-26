import { useEffect } from 'react';
import Markdown from 'react-markdown';
import { ServiceConfig, ServiceConfigApiKeyParameter } from '@/services';
import { deobfuscate, obfuscate } from '@/utils/obfuscateString';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Info } from 'lucide-react';

interface APIKeyParameterControlProps {

  param: ServiceConfigApiKeyParameter;

  service: ServiceConfig;

  value?: string;

  onValueChanged(value?: string): void;

}

export const APIKeyParameterControl = (props: APIKeyParameterControlProps) => {

  const { param, service, value } = props;

  const key = `immarkus:services:${service.id}:${param.id}`;

  useEffect(() => {
    // If there's no value on mount, try loading from localStorage
    const stored = localStorage.getItem(key);
    if (stored)
      props.onValueChanged(deobfuscate(stored));
  }, [key]);

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
      <div className="flex gap-2 items-center">
        <Label className="font-semibold">{param.displayName}</Label>
        {service.keyInstructions && (
          <Popover>
            <PopoverTrigger>
              <Info className="size-4 opacity-70 hover:opacity-100" />
            </PopoverTrigger>

            <PopoverContent 
              side="top"
              sideOffset={5}
              align="start"
              alignOffset={-10}
              collisionPadding={10}
              className="text-xs shadow-2xl p-4 w-96 leading-relaxed prose prose-p:py-1 prose-p:m-0 prose-ul:my-2 prose-ul:px-4">
              <Markdown>{service.keyInstructions}</Markdown>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <Input
        autoComplete="off"
        className="w-full my-2" 
        type="password" 
        value={value || ''} 
        onChange={evt => onChange(evt.target.value)} />
    </fieldset>
  )

}