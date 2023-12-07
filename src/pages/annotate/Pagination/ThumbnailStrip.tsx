import { useState } from 'react';
import { useTransition, animated, easings } from '@react-spring/web';
import { ThumbnailImage } from '@/components/ThumbnailImage';
import { Image, LoadedImage } from '@/model';
import { useStore } from '@/store';

interface ThumbnailStripProps {

  open: boolean;

  image: LoadedImage;

  onSelect(image: Image): void;

}

import './ThumbnailStrip.css';


export const ThumbnailStrip = (props: ThumbnailStripProps) => {

  const store = useStore();

  // Use a state for instant feedback!
  const [selected, setSelected] = useState(props.image.id);

  const { images } = store.getFolderContents(props.image.folder);

  const transitions = useTransition([props.open], {
    from: { maxHeight: 0 },
    enter: { maxHeight: 100 },
    leave: { maxHeight: 0 },
    config:{
      duration: 150,
      easing: easings.easeInCubic
    }
  });

  const onSelect = (image: Image) => () =>{
    setSelected(image.id);
    props.onSelect(image)
  }

  return transitions((style, open) => open && (
    <animated.section 
      style={style}
      className="thumbnail-strip overflow-hidden absolute bg-white left-0 w-full h-20 top-[100%] z-10 border-b border-b-slate-300/60 border-t">
      <ol className="flex gap-3 h-full items-center justify-center">
        {images.map(image => (
          <li 
            key={image.id}>
            <button
              className={selected === image.id ? 'block outline outline-2 outline-offset-2 rounded-sm outline-black' : 'block'}
              onClick={onSelect(image)}>
              <ThumbnailImage 
                image={image} 
                delay={160} />
            </button>
          </li>
        ))}
      </ol>
    </animated.section>
  ))

}