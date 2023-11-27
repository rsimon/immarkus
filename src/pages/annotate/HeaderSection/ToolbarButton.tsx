import { ReactNode } from 'react';

interface ToolbarButtonProps {

  children: ReactNode;

  className?: string;

  disabled?: boolean;

}

export const ToolbarButton = (props: ToolbarButtonProps) => {

  return (
    <button
      disabled={props.disabled}
      className={`text-xs rounded-md hover:bg-muted focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-25 disabled:hover:bg-transparent ${props.className || ''}`.trim()}>
      {props.children}
    </button>
  )

}
