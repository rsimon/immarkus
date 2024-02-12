import { PropertyTypeIcon } from '@/components/PropertyTypeIcon';
import { EntityType } from '@/model';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';
import { Replace } from 'lucide-react';

interface PropertyListTooltipProps {

  entityType: EntityType;

}

export const PropertyListTooltip = (props: PropertyListTooltipProps) => {

  /*

      <Tooltip>
        <TooltipTrigger 
          tabIndex={-1}>
          <Info className="h-3.5 w-3.5 ml-1.5 text-muted-foreground hover:text-black" />
        </TooltipTrigger>

        <TooltipContent>
          {props.description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  */

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-muted-foreground relative -top-[1px] text-[11.5px] inline-flex 
            justify-center items-center hover:bg-muted-foreground/20 ml-0.5 rounded-full w-6 h-6">
            +{props.entityType.properties.length - 3}
          </span>
        </TooltipTrigger>

        <TooltipContent>
          <ul className="text-white">
            {props.entityType.properties.map(p => (
              <li key={p.name} className="my-1 flex gap-2">
                <div className="flex gap-1">
                  <PropertyTypeIcon definition={p} />
                  <span>{p.name}</span>
                </div>
                
                {p.inheritedFrom && (
                  <span className="flex items-center gap-1 text-gray-400">
                    ({p.inheritedFrom})                  
                  </span>
                )}
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}