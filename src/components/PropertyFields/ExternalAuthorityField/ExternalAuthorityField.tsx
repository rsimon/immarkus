import { ChangeEvent, useRef } from 'react';
import { Info } from 'lucide-react';
import { ExternalAuthorityPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { InheritedFrom } from '../InheritedFrom';
import { ExternalAuthoritySelector } from './ExternalAuthoritySelector';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';
import { cn } from '@/ui/utils';

interface ExternalAuthorityFieldProps {

  id: string;

  className?: string;

  definition: ExternalAuthorityPropertyDefinition;

  value?: string;

  onChange?(value: string): void;

}

export const ExternalAuthorityField = (props: ExternalAuthorityFieldProps) => {

  const { id, definition } = props;

  const input = useRef<HTMLInputElement>();

  const value = props.onChange ? props.value || '' : props.value;

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement>) => props.onChange(evt.target.value) 
    : undefined;

  const onCloseDialog = () =>
    setTimeout(() => input.current.focus(), 1);

  return (
    <div className="mb-8">
      <div className="ml-0.5 flex justify-between items-center pr-1">
        <div className="flex flex-shrink-0">
          <Label htmlFor={id} >
            {definition.name}
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
        className={cn(props.className, 'mt-0.5')}
        value={value} 
        onChange={onChange} />
    </div>
  )

}