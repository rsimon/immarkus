import { useEffect, useRef, useState } from 'react';
import { ImageIcon, ImagePlus } from 'lucide-react';
import { useTransition, animated, easings } from '@react-spring/web';
import { ThumbnailImage } from '@/components/ThumbnailImage';
import { Image, LoadedImage } from '@/model';
import { useStore } from '@/store';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/ui/ContextMenu';

interface ThumbnailStripProps {

  open: boolean;

  image: LoadedImage;

  onSelect(image: Image): void;

  onAdd(image: Image): void;

}

import './ThumbnailStrip.css';

export const ThumbnailStrip = (props: ThumbnailStripProps) => {

  const store = useStore();

  // Use a state for instant feedback!
  const [selected, setSelected] = useState(props.image.id);

  const { images } = store.getFolderContents(props.image.folder);

  useEffect(() => setSelected(props.image.id), [props.image.id]);

  const transitions = useTransition([props.open], {
    from: { maxHeight: 0 },
    enter: { maxHeight: 100 },
    leave: { maxHeight: 0 },
    config:{
      duration: 150,
      easing: easings.easeInCubic
    }
  });

  const onSelect = (image: Image) => {
    setSelected(image.id);
    props.onSelect(image)
  }

  return transitions((style, open) => open && (
    <animated.section 
      style={style}
      className="thumbnail-strip overflow-x-auto absolute bg-white left-0 w-full h-20 top-[100%] z-10 border-b border-b-slate-300/60 border-t">
      <ol className="flex gap-3 h-full items-center justify-center">
        {images.map(image => (
          <li 
            key={image.id}
            className="flex-shrink-0">
            <ContextMenu>
              <ContextMenuTrigger>
                <button
                  className={selected === image.id 
                    ? 'block outline outline-2 outline-offset-2 rounded-sm outline-black' 
                    : 'block hover:outline outline-2 outline-offset-2 rounded-sm outline-black'}
                  onClick={() => onSelect(image)}>
                  <ThumbnailImage 
                    image={image} 
                    delay={160} />
                </button>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem 
                  className="flex gap-2 items-center text-xs"
                  onClick={() => onSelect(image)}>
                  <ImageIcon className="h-3.5 w-3.5" /> Select this image
                </ContextMenuItem>

                <ContextMenuItem 
                  className="flex gap-2 items-center text-xs"
                  onClick={() => props.onAdd(image)}>
                  <ImagePlus className="h-3.5 w-3.5" /> Add image to workspace
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </li>
        ))}
      </ol>
    </animated.section>
  ))

}