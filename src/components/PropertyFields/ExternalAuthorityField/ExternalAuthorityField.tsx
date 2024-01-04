import { ChangeEvent, useRef } from 'react';
import { Info } from 'lucide-react';
import { ExternalAuthorityPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { cn } from '@/ui/utils';
import { InheritedFrom } from '../InheritedFrom';
import { ExternalAuthoritySelector } from './ExternalAuthoritySelector';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';

interface ExternalAuthorityFieldProps {

  id: string;

  className?: string;

  definition: ExternalAuthorityPropertyDefinition;

  validate?: boolean;

  value?: string;

  onChange?(value: string): void;

}

export const ExternalAuthorityField = (props: ExternalAuthorityFieldProps) => {

  const { id, definition, validate } = props;

  const input = useRef<HTMLInputElement>();

  const value = props.onChange ? props.value || '' : props.value;
  
  const isValid = !(validate && definition.required && !value);

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement>) => props.onChange(evt.target.value) 
    : undefined;

  const onCloseDialog = () =>
    setTimeout(() => input.current.focus(), 1);

  const className = cn(props.className, (isValid ? 'mt-0.5' : 'mt-0.5 border-red-500'));

  return (
    <div className="mb-8">
      <div className="ml-0.5 flex justify-between items-center pr-1">
        <div className="flex flex-shrink-0">
          <Label htmlFor={id} >
            {definition.name}
            {!isValid && (
              <span className="text-xs text-red-600 ml-1">required</span>
            )}
          </Label> 

          {definition.description && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger 
                  tabIndex={-1}>
                  <Info className="h-3.5 w-3.5 ml-1.5 text-muted-foreground hover:text-black" />
                </TooltipTrigger>

                <TooltipContent>
                  {definition.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div> 
          
        <div className="flex text-muted-foreground">
          <ExternalAuthoritySelector
            definition={props.definition} 
            onCloseDialog={onCloseDialog} />  

          <div className="flex relative -top-[1px]">
            <InheritedFrom definition={definition} />
          </div>
        </div> 
      </div> 

      <Input
        ref={input}
        id={id} 
        className={className} 
        value={value} 
        onChange={onChange} />
    </div>
  )

}