import { useEffect, useState } from 'react';
import { CopyPlus, Info } from 'lucide-react';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { ExternalAuthorityPropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InheritedFrom } from '../InheritedFrom';
import { removeEmpty } from '../removeEmpty';
import { ExternalAuthorityFieldInput } from './ExternalAuthorityFieldInput';
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

  value?: string | string[];

  onChange?(value?: string | string[]): void;

}

export const ExternalAuthorityField = (props: ExternalAuthorityFieldProps) => {

  const { id, definition } = props;

  const { authorities } = useRuntimeConfig();
  
  const [values, setValues] = useState<(string | undefined)[]>(Array.isArray(props.value) ? props.value : [props.value]);

  const [editable, _setEditable] = useState<Set<number>>(new Set([]));

  const onCloseDialog = (identifier?: string) => { 
    if (!props.onChange) return;

    if (definition.multiple) {
      if (identifier) {
        // Multi-value. Fill first 'undefined' field or append new
        const firstEmpty = values.findIndex(str => !str);

        if (firstEmpty > -1) {
          setValues([
            ...values.slice(0, firstEmpty),
            identifier,
            ...values.slice(firstEmpty + 1)
          ]);
        } else {
          setValues([...values, identifier]);
        }
      }
    } else {
      // Single-value field - replace
      if (identifier)
        setValues([identifier]);

      _setEditable(new Set([0]))
    }
  }

  useEffect(() => {
    if (props.onChange) {
      const normalized = removeEmpty(values);
      props.onChange(normalized);
    } else {
      props.onChange();
    }
  }, [values]);

  const setEditable = (index: number, editable: boolean) => {
    if (editable)
      _setEditable(current => new Set([...current, index]));
    else
      _setEditable(current => new Set([...current].filter(n => n !== index)))
  }

  const onAppendField = () => {
    _setEditable(current => new Set([...current, values.length]));
    setValues(current => [...current, undefined]);
  }

  const onChange = (idx: number) => (updated: string) =>
    setValues(current => current.map((v, i) => i === idx ? updated : v));

  return (
    <div className="mb-8">
      <div className="ml-0.5 mb-1.5 flex justify-between items-center pr-1">
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

      <div className="flex flex-col gap-2 justify-end">
        {values.map((value, idx) => (
          <ExternalAuthorityFieldInput 
            key={`${idx}`}
            authorities={authorities} 
            className={props.className}
            editable={editable.has(idx)} 
            value={value}
            onChange={onChange(idx)}
            onSetEditable={editable => setEditable(idx, editable)} />
        ))}

        {props.definition.multiple && (
          <button 
            className="self-end flex gap-1 items-center text-xs text-muted-foreground mt-0.5 mr-0.5"
            type="button"
            onClick={onAppendField}>
            <CopyPlus className="h-3.5 w-3.5 mb-0.5 mr-0.5" /> Add value
          </button>
        )}
      </div>
    </div>
  )

}