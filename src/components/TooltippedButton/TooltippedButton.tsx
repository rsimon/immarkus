import { ReactNode, forwardRef } from 'react';
import { Button } from '@/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';

interface TooltippedButtonProps {

  asChild?: boolean;

  className?: string;

  children: ReactNode;

  onClick?(): void;

  size?: 'default' | 'sm' | 'lg' | 'icon';
  
  tooltip: ReactNode;

  type?: 'submit' | 'button';
  
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

}

export const TooltippedButton = forwardRef<HTMLButtonElement, TooltippedButtonProps>((props, ref) => {

  const { children, tooltip, ...rest } = props;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button {...rest} ref={ref}>
            {props.children}
          </Button>

        </TooltipTrigger>

        <TooltipContent>
          {props.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

});