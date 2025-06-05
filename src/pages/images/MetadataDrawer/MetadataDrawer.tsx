import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { animated, easings, useTransition } from '@react-spring/web';
import { Button } from '@/ui/Button';
import { FolderItem, OverviewItem, ImageItem } from '../Types';
import { FolderMetadataPanel } from './FolderMetadataPanel';
import { ImageMetadataPanel } from './ImageMetadataPanel';
import { IIIFManifestMetadataPanel, IIIFCanvasMetadataPanel } from './IIIFMetadataPanel';

interface MetadataDrawerProps {

  item?: OverviewItem;

  onClose(): void;

}

export const MetadataDrawer = (props: MetadataDrawerProps) => {

  const previous = useRef<OverviewItem | undefined>(null);

  const isInitial = useRef(true);

  const shouldSkipAnimation =
   // Drawer is currently open and data changes
   (previous.current && props.item);

  const transition = useTransition([props.item], {
    from: { width: 0 },
    enter: { width: 340 },
    leave: { width: 0 },
    config:{
      duration: shouldSkipAnimation ? 0 : 150,
      easing: easings.easeInCubic
    },
    onRest: () => isInitial.current = false
  });

  useEffect(() => {
    previous.current = props.item;
  }, [props.item]);

  // @ts-ignore
  return transition((style, item) => item && (
    <animated.div 
      style={style}
      className="grow-0 shrink-0 relative border-l">
      <aside className="w-[340px] overflow-hidden absolute top-0 left-0 h-full overflow-y-auto box-border">
        <Button 
          size="icon"
          variant="ghost"
          onClick={props.onClose}
          className="absolute text-muted-foreground right-2 top-2 rounded-full z-10 p-1 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring">
          <X className="w-6 h-6 p-0.5" />
        </Button>

        {item.type === 'folder' ? (
          <FolderMetadataPanel 
            folder={item as FolderItem} />
        ) : item.type === 'image' ? (
          <ImageMetadataPanel 
            image={item as ImageItem} />
        ) : item.type === 'PRESENTATION_MANIFEST' ? (
          <IIIFManifestMetadataPanel item={item} />
        ) : item.type === 'canvas' ? (
          <IIIFCanvasMetadataPanel item={item} />
        ) : null}
      </aside>
    </animated.div>
  ))

}