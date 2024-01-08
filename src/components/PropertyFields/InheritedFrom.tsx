import { PropertyDefinition } from '@/model';
import { Replace } from 'lucide-react';
import { useDataModel } from '@/store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';

interface InheritedFromProps {

  definition: PropertyDefinition;

}

export const InheritedFrom = (props: InheritedFromProps) => {

  const model = useDataModel();

  const inheritedFrom = model.getEntityType(props.definition.inheritedFrom, false);

  return inheritedFrom && (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger 
          tabIndex={-1}
          className="rounded-sm w-6 h-6 relative ml-1 -top-[1px] inline-flex justify-center items-center focus-visible:bg-slate-200 focus-visible:outline-none">
          <Replace className="h-5 w-5 p-0.5 relative text-muted-foreground" />
        </TooltipTrigger>

        <TooltipContent 
          align="end" 
          alignOffset={-10}
          sideOffset={-6}>
          <span className="text-white/70">Inherited from</span> <span>{inheritedFrom.label || inheritedFrom.id}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

}