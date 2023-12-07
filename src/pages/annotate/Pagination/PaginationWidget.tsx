import { useState } from 'react';
import { Image, LoadedImage } from '@/model';
import { useStore } from '@/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ToolbarButton } from '../HeaderSection/ToolbarButton';
import { ThumbnailStrip } from './ThumbnailStrip';

interface PaginationWidgetProps {

  disabled?: boolean;

  image: LoadedImage;

  variant?: 'compact';

  onChangeImage(previous: Image, next: Image): void;

}

export const PaginationWidget = (props: PaginationWidgetProps) => {

  const store = useStore();

  const { images } = store.getFolderContents(props.image.folder);

  const currentIndex = images.map(i => i.id).indexOf(props.image.id);

  const [showThumbnails, setShowThumbnails] = useState(false);

  const isCompact = props.variant === 'compact';

  const onSkipImage = (inc: number) => {
    const nextIdx = Math.min(Math.max(0, currentIndex + inc), images.length - 1);
    props.onChangeImage(images[currentIndex], images[nextIdx]);
  }

  const onSetImage = (image: Image) =>
    props.onChangeImage(images[currentIndex], image);

  return (
    <div className={isCompact ? 'flex mx-1' : 'flex mr-1'}>
      {isCompact ? (
        <button 
          className="text-muted-foreground hover:text-black disabled:text-muted-foreground/30"
          disabled={props.disabled || currentIndex === 0}
          onClick={() => onSkipImage(-1)}>
          <ChevronLeft className="w-4 px-0" />
        </button>
      ) : (
        <ToolbarButton 
          disabled={props.disabled || currentIndex === 0}
          className="mr-1"
          onClick={() => onSkipImage(-1)}>
          <ChevronLeft className="w-5 h-8 py-2 px-0 mr-0.5" />
        </ToolbarButton>
      )}

      {isCompact ? (
        <button 
          className="text-muted-foreground hover:text-black"
          disabled={props.disabled}
          onClick={() => setShowThumbnails(show => !show)}>
          <span className="w-8 inline-block whitespace-nowrap">
            {currentIndex + 1} / {images.length}
          </span>
        </button>
      ) : (
        <ToolbarButton 
          disabled={props.disabled}
          className="py-1 bg-muted disabled:bg-transparent hover:bg-slate-200"
          onClick={() => setShowThumbnails(show => !show)}>
          <span className="w-12 inline-block px-1.5 whitespace-nowrap">
            {currentIndex + 1} / {images.length}
          </span>
        </ToolbarButton>
      )}

      {isCompact ? (
        <button 
          className="text-muted-foreground hover:text-black disabled:text-muted-foreground/30"
          disabled={props.disabled || currentIndex === images.length - 1}
          onClick={() => onSkipImage(1)}>
          <ChevronRight className="w-4 px-0" />
        </button>
      ) : (
        <ToolbarButton 
          className="ml-1"
          disabled={props.disabled || currentIndex === images.length - 1}
          onClick={() => onSkipImage(1)}>
          <ChevronRight className="w-5 h-8 py-2 px-0" />
        </ToolbarButton>
      )}

      <ThumbnailStrip 
        image={props.image} 
        open={false} 
        onSelect={onSetImage} />
    </div>
  )

}