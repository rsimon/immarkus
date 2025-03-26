import { useEffect, useState, useRef, useMemo } from 'react';
import { CanvasInformation, FileImage, IIIFManifestResource, LoadedImage } from '@/model';
import { useStore } from '@/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseIIIFId } from '@/utils/iiif';
import { ToolbarButton } from '../ToolbarButton';
import { ThumbnailStrip } from './ThumbnailStrip';
import { useClickOutside } from './useClickoutside';

interface PaginationWidgetProps {

  disabled?: boolean;

  image: LoadedImage;

  variant?: 'compact';

  onChangeImage(previousId: string, nextId: string): void;

  onAddImage(imageId: string): void;

}

export const PaginationWidget = (props: PaginationWidgetProps) => {

  const store = useStore();

  const el = useRef();

  const images = useMemo(() => {
    if ('data' in props.image) {
      // FileImage
      const contents = store.getFolderContents(props.image.folder);
      return contents ? contents.images : [];
    } else {
      // IIIF 
      const { canvases } = store.getIIIFResource(props.image.manifestId) as IIIFManifestResource;
      return canvases;
    }
    
  }, [store, props.image]);

  const currentIndex = useMemo(() => {
    const id = props.image.id.startsWith('iiif:') ? parseIIIFId(props.image.id)[1] : props.image.id;
    return images.map((i: FileImage | CanvasInformation) => i.id).indexOf(id);
  }, [props.image, images]);

  const [showThumbnails, setShowThumbnails] = useState(false);

  const isCompact = props.variant === 'compact';

  useEffect(() => {
    if (props.disabled) setShowThumbnails(false);
  }, [props.disabled]);

  useClickOutside(el, () => setShowThumbnails(false));

  const onSkipImage = (inc: number) => {
    const nextIdx = Math.min(Math.max(0, currentIndex + inc), images.length - 1);
    const nextSource = images[nextIdx];

    if ( 'manifestId' in nextSource) {
      const currentId = `iiif:${nextSource.manifestId}:${images[currentIndex].id}`;
      const nextId = `iiif:${nextSource.manifestId}:${nextSource.id}`;
      props.onChangeImage(currentId, nextId);
    } else {
      props.onChangeImage(images[currentIndex].id, images[nextIdx].id);
    }
  }

  const onSetImage = (imageId: string) => {
    const currentImage = images[currentIndex];

    if ('manifestId' in currentImage) {
      const currentId = `iiif:${currentImage.manifestId}:${currentImage.id}`;
      const nextId = `iiif:${currentImage.manifestId}:${imageId}`;
      props.onChangeImage(currentId, nextId);
    } else {
      props.onChangeImage(currentImage.id, imageId);
    }
  }

  return (
    <div
      ref={el} 
      className={isCompact ? 'flex mx-1' : 'flex mr-1'}>
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
          className="text-muted-foreground hover:text-black disabled:text-muted-foreground/30"
          disabled={props.disabled || images.length < 2}
          onClick={() => setShowThumbnails(show => !show)}>
          <span className="min-w-8 inline-block whitespace-nowrap">
            {currentIndex + 1} / {images.length}
          </span>
        </button>
      ) : (
        <ToolbarButton 
          disabled={props.disabled || images.length < 2}
          className="py-1 bg-muted disabled:bg-transparent hover:bg-slate-200"
          onClick={() => setShowThumbnails(show => !show)}>
          <span className="min-w-12 inline-block px-1.5 whitespace-nowrap">
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
        currentImage={props.image} 
        images={images}
        open={showThumbnails} 
        onSelect={onSetImage} 
        onAdd={props.onAddImage} />
    </div>
  )

}