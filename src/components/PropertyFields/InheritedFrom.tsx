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
        <TooltipTrigger>
          <Replace className="h-4 w-4 relative top-0.5 text-muted-foreground" />
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