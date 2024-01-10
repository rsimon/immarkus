import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';

interface InfoTooltipProps {

  description: string;

}

export const InfoTooltip = (props: InfoTooltipProps) => {

  return (
    <TooltipProvider delayDuration={200}>
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
  )

}