import { PropertyTypeIcon } from '@/components/PropertyTypeIcon';
import { PropertyDefinition } from '@/model';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';

interface PropertyListTooltipProps {

  properties: PropertyDefinition[];

}

export const PropertyListTooltip = (props: PropertyListTooltipProps) => {

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-muted-foreground relative -top-[1px] text-[11.5px] inline-flex 
            justify-center items-center hover:bg-muted-foreground/20 ml-0.5 rounded-full w-6 h-6">
            +{props.properties.length - 3}
          </span>
        </TooltipTrigger>

        <TooltipContent>
          <ul className="text-white min-w-20">
            {props.properties.map(p => (
              <li key={p.name} className="my-1 flex gap-2">
                <div className="flex gap-1 items-center">
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