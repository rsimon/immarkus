import { ReactNode, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useTransition, animated, easings } from '@react-spring/web';
import { cn } from '@/ui/utils';
import { Button } from '@/ui/Button';

interface DrawerProps {

  className?: string;

  closeButton?: boolean;

  children?: ReactNode;

  duration?: number;

  open: boolean;

  skipInitialAnimation?: boolean;

  width?: number;

  onClose(): void;

}

export const Drawer = (props: DrawerProps) => {

  const width = props.width || 340;

  const className = cn('grow-0 shrink-0 relative border-l', props.className);

  const [open, setOpen] = useState(props.open);

  const transition = useTransition([open], {
    from: { width: 0 },
    enter: { width },
    leave: { width: 0 },
    config:{
      duration: 150,
      easing: easings.easeInCubic
    }
  });

  useEffect(() => setOpen(props.open), [props.open]);

  return transition((style, open) => open && (
    <animated.div 
      style={style}
      className={className}>
      <aside className="w-[340px] overflow-hidden absolute top-0 left-0 h-full overflow-y-auto box-border">
        {props.closeButton && (
          <Button 
            size="icon"
            variant="ghost"
            onClick={props.onClose}
            className="absolute text-muted-foreground right-2 top-2 rounded-full z-10 p-1 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring">
            <X className="w-6 h-6 p-0.5" />
          </Button>
        )}
        {props.children}
      </aside>
    </animated.div>
  ))

}