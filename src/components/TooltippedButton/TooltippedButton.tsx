import { ReactNode } from 'react';
import { VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '@/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';

interface TooltippedButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {

  asChild?: boolean;
  
  tooltip: ReactNode;
  
}

export const TooltippedButton = (props: TooltippedButtonProps) => {

  const { children, tooltip, ...rest } = props;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger tabIndex={-1}>
          <Button {...rest}>
            {props.children}
          </Button>

        </TooltipTrigger>

        <TooltipContent>
          {props.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

}