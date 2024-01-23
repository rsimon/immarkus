import { ChangeEvent, useRef, useState } from 'react';
import { Info, Pen } from 'lucide-react';
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
import { useRuntimeConfig } from '@/RuntimeConfig';

interface ExternalAuthorityFieldProps {

  id: string;

  className?: string;

  definition: ExternalAuthorityPropertyDefinition;

  value?: string;

  onChange?(value: string): void;

}

export const ExternalAuthorityField = (props: ExternalAuthorityFieldProps) => {

  const { id, definition } = props;

  const { authorities } = useRuntimeConfig();

  const input = useRef<HTMLInputElement>();

  const value = props.onChange ? props.value || '' : props.value;

  const isURI = value ? /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value) : false;

  const [editable, setEditable] = useState(!isURI);

  const onChange = props.onChange 
    ? (evt: ChangeEvent<HTMLInputElement>) => props.onChange(evt.target.value) 
    : undefined;

  const onCloseDialog = (identifier?: string) => { 
    if (identifier && props.onChange)
      props.onChange(identifier);

    setEditable(true);

    setTimeout(() => input.current.focus(), 1);
  }

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
            authorities={authorities.filter(a => (props.definition.authorities || []).includes(a.name))} 
            onCloseDialog={onCloseDialog} />  

          <div className="flex relative -top-[1px]">
            <InheritedFrom definition={definition} />
          </div>
        </div> 
      </div> 

      {editable ? (
        <Input
          ref={input}
          id={id} 
          className={cn(props.className, 'mt-0.5')}
          value={value} 
          onChange={onChange} 
          onBlur={() => setEditable(!isURI)} />
      ) : (
        <div className={cn('flex h-9 w-full overflow-hidden shadow-sm bg-muted rounded-md border border-input pl-2.5 pr-1 items-center', props.className)}>
          <a 
            href={value} 
            className="flex-grow text-sky-700 hover:underline overflow-hidden text-ellipsis pr-1"
            target="_blank">{value}</a>

          <button 
            onClick={() => setEditable(true)}
            className="rounded-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground">
            <Pen
              className="w-5.5 h-5.5 p-1 text-muted-foreground hover:text-black" />
          </button>
        </div>
      )}
    </div>
  )

}