import { Cuboid } from 'lucide-react';
import { EntityType } from '@/model';
import { DEFAULT_COLOR, getForegroundColor } from '@/utils/color';
import { cn } from '@/ui/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';

interface BadgeEntityProps {
  
  className?: string;

  entityType?: EntityType;

}

export const EntityBadge = (props: BadgeEntityProps) => {

  const { entityType } = props;

  const backgroundColor = entityType?.color || DEFAULT_COLOR;

  const badge = (
    <span
      className={cn('rounded-full pl-2.5 pr-3 py-1 inline-flex items-center text-xs h-6 cursor-pointer', props.className)}
      style={{ 
        backgroundColor,
        color: getForegroundColor(backgroundColor)
      }}>

      <Cuboid className="h-3.5 w-3.5 mr-1.5"/> {entityType?.label || entityType?.id || 'error'}
    </span>
  )

  return entityType?.description ? (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger tabIndex={-1} asChild>
          {badge}
        </TooltipTrigger>

        <TooltipContent>
          {entityType.description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : badge;

}