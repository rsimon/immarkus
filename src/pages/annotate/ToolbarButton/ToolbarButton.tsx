import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';

interface ToolbarButtonProps {

  children: ReactNode;

  tooltip?: string;

  className?: string;

  disabled?: boolean;

  onClick?(evt: React.MouseEvent): void;

}

export const ToolbarButton = (props: ToolbarButtonProps) => {

  const renderButton = () => (
    <button
      {...props}
      disabled={props.disabled}
      className={`${props.className || ''} text-xs rounded-md hover:bg-muted focus-visible:outline-hidden 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-25 disabled:hover:bg-transparent`.trim()}
      onClick={props.onClick}>
      {props.children}
    </button>
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
