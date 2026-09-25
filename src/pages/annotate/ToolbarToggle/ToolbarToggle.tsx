import { ReactNode } from 'react';
import { Toggle } from '@/ui/Toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { cn } from '@/ui/utils';

interface ToolbarToggleProps {

  children: ReactNode;

  tooltip?: string;

  className?: string;

  disabled?: boolean;

  pressed?: boolean;

  onPressedChange(pressed: boolean): void;

}

export const ToolbarToggle = (props: ToolbarToggleProps) => {

  const renderButton = () => (
    <Toggle
      disabled={props.disabled}
      size="sm"
      className={cn(props.className, 'hover:text-black h-auto w-auto p-0')}
      pressed={props.pressed}
      onPressedChange={props.onPressedChange}>
      {props.children}
    </Toggle>
  )

  return (props.tooltip && !props.disabled) ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {renderButton()}
      </TooltipTrigger>

      <TooltipContent>
        {props.tooltip}
      </TooltipContent>
    </Tooltip>
  ) : renderButton();

}
