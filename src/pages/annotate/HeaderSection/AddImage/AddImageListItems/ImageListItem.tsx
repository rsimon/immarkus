import { IIIFIcon } from '@/components/IIIFIcon';
import { Thumbnail } from '@/components/Thumbnail';
import { CanvasInformation, FileImage } from '@/model';
import { Check } from 'lucide-react';

interface ImageListItemProps {

  image: FileImage | CanvasInformation;

  isOpen: boolean;

  onSelect(): void;

}

export const ImageListItem = (props: ImageListItemProps) => {

  const { image, isOpen, onSelect } = props;

  const isIIIF = 'manifestId' in image;

  return (
    <li 
      className={`mt-0.5 py-2 px-3 rounded-lg cursor-pointer${isOpen ?  '' : ' hover:bg-muted'}`}>
      <button 
        disabled={isOpen}
        className="flex gap-3 w-full relative"
        onClick={onSelect}>
        {isOpen ? (
          <div className="relative">
            <Thumbnail image={image} /> 
            <div className="absolute w-full h-full top-0 left-0 bg-white/60 flex items-center justify-center">
              <Check className="text-black h-10 w-10" />
            </div>
          </div>
        ) : (
          <Thumbnail image={image} /> 
        )}

        {isIIIF && (
          <IIIFIcon
            light
            className="iiif-logo text-white transition-all absolute bottom-1.5 left-1.5 size-4" />
        )}
        
        <div className="grow line-clamp-3 overflow-hidden text-ellipsis text-left">
          {image.name}
        </div>
      </button>
    </li>
  )

}