import { useEffect, useRef } from 'react';
import { useTransition, animated, easings } from '@react-spring/web';
import { GridItem } from '../ItemGrid';

interface MetadataDrawerProps {

  item?: GridItem;

  onClose(): void;

}

export const MetadataDrawer = (props: MetadataDrawerProps) => {

  const previous = useRef<GridItem | undefined>();

  const shouldAnimate = 
    // Drawer currently closed, and should open
    !previous.current && props.item ||
    // Drawer currently open, and should close
    previous.current && !props.item;

  const transition = useTransition([props.item], {
    from: { maxWidth: 0 },
    enter: { maxWidth: 200 },
    leave: { maxWidth: 0 },
    config:{
      duration: shouldAnimate ? 150 : 0,
      easing: easings.easeInCubic
    }
  });

  useEffect(() => {
    previous.current = props.item;
  }, [props.item]);

  return transition((style, item) => item && (
    <animated.div 
      style={style}
      className="bg-red-400 w-[200px] relative">

    </animated.div>
  ))

}