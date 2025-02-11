import { ReactNode } from 'react';

interface ToolbarButtonProps {

  children: ReactNode;

  className?: string;

  disabled?: boolean;

  onClick?(evt: React.MouseEvent): void;

}

export const ToolbarButton = (props: ToolbarButtonProps) => {

  return (
    <button
      disabled={props.disabled}
      className={`${props.className || ''} text-xs rounded-md hover:bg-muted focus-visible:outline-hidden 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-25 disabled:hover:bg-transparent`.trim()}
      onClick={props.onClick}>
      {props.children}
    </button>
  )

}
