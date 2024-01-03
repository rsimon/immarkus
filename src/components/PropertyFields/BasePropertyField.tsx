import { PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InheritedFrom } from './InheritedFrom';
import { ReactNode } from 'react';
import { PropertyTypeIcon } from './PropertyTypeIcon';
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

  const tooltip = 
    definition.type === 'enum' ? 'Options' : 
    definition.type === 'external_authority' ? 'External Authority' :
    definition.type === 'geocoordinate' ? 'Geo-Coordinate' :
    definition.type === 'measurement' ? 'Measurement' :
    definition.type === 'number' ? 'Number' :
    definition.type === 'text' ? 'Text' :
    definition.type === 'uri' ? 'URI' : undefined;

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between pr-1 mb-1 text-muted-foreground">
        <div className="flex items-center">
          <Label
            htmlFor={props.id}
            className="text-xs inline-block ml-0.5 ">
            {definition.name}
          </Label>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger 
                tabIndex={-1}>
                <PropertyTypeIcon 
                  definition={definition} 
                  className="text-slate-400 ml-0.5" />
              </TooltipTrigger>

              <TooltipContent>
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!props.error && (<span className="text-xs text-red-600 ml-1">{props.error}</span>)}
        </div>

        <InheritedFrom definition={definition} />
      </div>

      {props.children}

      {definition.description && (
        <p className="text-muted-foreground mt-1.5 text-[12px] px-0.5">
          {definition.description}
        </p>
      )}
    </div>
  )

}