import { PropertyDefinition } from '@/model';
import { Replace } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';
import { useStore } from '@/store';

interface InheritedFromProps {

  definition: PropertyDefinition;

}

export const InheritedFrom = (props: InheritedFromProps) => {

  const store = useStore();

  const inheritedFrom = store.getEntityType(props.definition.inheritedFrom, false);

  return inheritedFrom && (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger 
          className="rounded-sm w-6 h-6 relative ml-1 top-[1px] inline-flex justify-center items-center focus-visible:bg-slate-200 focus-visible:outline-none">
          <Replace className="h-5 w-5 p-0.5 relative text-muted-foreground" />
        </TooltipTrigger>

        <TooltipContent 
          align="end" 
          alignOffset={-10}
          sideOffset={-6}>
          <span className="text-muted-foreground">Inherited from</span> <span className="font-medium">{inheritedFrom.label || inheritedFrom.id}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

}