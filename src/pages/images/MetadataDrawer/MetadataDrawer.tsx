import { useTransition, animated, easings } from '@react-spring/web';

interface MetadataDrawerProps {

  open?: boolean;

}

export const MetadataDrawer = (props: MetadataDrawerProps) => {

  /*
  const transition = useTransition([props.open], {
    from: { maxHeight: 0 },
    enter: { maxHeight: 100 },
    leave: { maxHeight: 0 },
    config:{
      duration: 150,
      easing: easings.easeInCubic
    }
  });

  return transition((style, open) => open && (
    <animated.section 
      style={style}>

    </animated.section>
  ))
  */

}