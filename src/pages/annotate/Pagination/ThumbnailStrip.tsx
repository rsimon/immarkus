import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon, ImagePlus } from 'lucide-react';
import { useTransition, animated, easings } from '@react-spring/web';
import { Thumbnail } from '@/components/Thumbnail';
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

  const el = useRef<HTMLOListElement>();

  const store = useStore();

  // Use a state for instant feedback!
  const [selected, setSelected] = useState(props.image.id);

  const [scrollable, setScrollable] = useState(false);

  const { images } = store.getFolderContents(props.image.folder);

  useEffect(() => setSelected(props.image.id), [props.image.id]);

  const transition = useTransition([props.open], {
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

  const onScroll = (inc: number) => () =>
    el.current.scrollLeft += inc * 112;

  useLayoutEffect(() => {
    if (props.open) {
      const updateScrollable = () => {
        if (el.current?.scrollWidth > el.current?.clientWidth)
          setScrollable(true);
        else
          setScrollable(false);
      }

      const resizeObserver = new ResizeObserver(() => updateScrollable());
      resizeObserver.observe(el.current);

      return () => {
        resizeObserver.disconnect();
      }
    }
  }, [props.open]);

  return transition((style, open) => open && (
    <animated.section 
      style={style}
      className="thumbnail-strip flex justify-center overflow-hidden absolute bg-white left-0 w-full h-20 top-[100%] z-10 border-b border-b-slate-300/60 border-t">
      
      {scrollable && (
        <button 
          onClick={onScroll(-1)}
          className="absolute top-0 left-0 bg-white/60 h-full text-muted-foreground hover:text-black hover:bg-white/40">
          <ChevronLeft className="h-8 w-8" strokeWidth={1.2} />
        </button>
      )}

      <ol 
        ref={el}
        className="flex justify-start px-8 h-full items-center whitespace-nowrap overflow-x-auto">
        {images.map(image => (
          <li 
            key={image.id}
            className="flex-shrink-0 inline-block mx-1.5">
            <ContextMenu>
              <ContextMenuTrigger>
                <button
                  className={selected === image.id 
                    ? 'block outline outline-2 outline-offset-2 rounded-sm outline-black' 
                    : 'block hover:outline outline-2 outline-offset-2 rounded-sm outline-black'}
                  onClick={() => onSelect(image)}>
                  <Thumbnail 
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

      {scrollable && (
        <button 
          onClick={onScroll(1)}
          className="absolute top-0 right-0 bg-white/70 h-full text-muted-foreground hover:text-black hover:bg-white/90">
          <ChevronRight className="h-8 w-8" strokeWidth={1.2} />
        </button>
      )}
    </animated.section>
  ))

}