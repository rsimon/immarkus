import { Image, LoadedImage } from '@/model';
import { useStore } from '@/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ToolbarButton } from '../ToolbarButton';
import { ThumbnailStrip } from './ThumbnailStrip';

interface PaginationWidgetProps {

  image: LoadedImage;

  onChangeImage(image: Image): void;

}

export const PaginationWidget = (props: PaginationWidgetProps) => {

  const store = useStore();

  const { images } = store.getFolderContents(props.image.folder);

  const currentIndex = images.map(i => i.id).indexOf(props.image.id);

  const onChangeImage = (inc: number) => {
    const nextIdx = Math.min(Math.max(0, currentIndex + inc), images.length - 1);
    props.onChangeImage(images[nextIdx]);
  }

  return (
    <div className="flex mr-1">
      <ToolbarButton 
        disabled={currentIndex === 0}
        className="mr-1"
        onClick={() => onChangeImage(-1)}>
        <ChevronLeft className="w-5 h-8 py-2 px-0 mr-0.5" />
      </ToolbarButton>

      <ToolbarButton className="py-1 bg-muted hover:bg-slate-200 ">
        <span className="w-12 inline-block px-1.5 whitespace-nowrap">
          {currentIndex + 1} / {images.length}
        </span>
      </ToolbarButton>

      <ToolbarButton 
        className="ml-1"
        disabled={currentIndex === images.length - 1}
        onClick={() => onChangeImage(1)}>
        <ChevronRight className="w-5 h-8 py-2 px-0" />
      </ToolbarButton>

      {/* <ThumbnailStrip image={props.image} /> */}
    </div>
  )

}