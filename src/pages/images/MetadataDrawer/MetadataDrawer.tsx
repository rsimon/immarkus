import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTransition, animated, easings } from '@react-spring/web';
import { FolderGridItem, GridItem, ImageGridItem } from '../ItemGrid';
import { FolderMetadataPanel } from './FolderMetadataPanel';
import { ImageMetadataPanel } from './ImageMetadataPanel';

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
    from: { flexBasis: 0 },
    enter: { flexBasis: 340 },
    leave: { flexBasis: 0 },
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
      className="flex-grow-0 flex-shrink-0 relative border-l shadow-sm">
      <aside className="w-[340px] absolute top-0 left-0 h-full overflow-y-auto py-4 px-6">
        {item.type === 'folder' ? (
          <FolderMetadataPanel 
            folder={item as FolderGridItem}/>
        ) : item.type === 'image' && (
          <ImageMetadataPanel 
            image={item as ImageGridItem}/>
        )}
      </aside>

      <button 
        onClick={props.onClose}
        className="absolute left-[300px] top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
        <X className="w-5 h-5 p-0.5" />
      </button>
    </animated.div>
  ))

}