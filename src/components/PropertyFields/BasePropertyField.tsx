import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InheritedFrom } from './InheritedFrom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';

interface BasePropertyFieldProps {

  id: string;

  definition: PropertyDefinition;

  children: ReactNode;

  error?: string;

}

export const BasePropertyField = (props: BasePropertyFieldProps) => {

  const { definition } = props;

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between pr-1 mb-1.5">
        <div className="flex">
          <Label
            htmlFor={props.id}
            className="text-sm inline-block ml-0.5 ">
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

          {!props.error && (<span className="text-xs text-red-600 ml-1">{props.error}</span>)}
        </div>
        
        <InheritedFrom definition={definition} />
      </div>

      {props.children}
    </div>
  )

}