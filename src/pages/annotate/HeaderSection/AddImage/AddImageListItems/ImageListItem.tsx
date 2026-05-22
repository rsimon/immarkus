import { Check, MessagesSquare } from 'lucide-react';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Thumbnail } from '@/components/Thumbnail';
import { CanvasInformation, FileImage } from '@/model';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/ui/HoverCard';

interface ImageListItemProps {

  annotations: number;

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
        <div className="relative">
          <HoverCard>
            <HoverCardTrigger>
              <Thumbnail image={image} /> 
              {isOpen && (
                <div className="absolute w-full h-full top-0 left-0 bg-white/60 flex items-center justify-center">
                  <Check className="text-black h-10 w-10" />
                </div>
              )}
            </HoverCardTrigger>

            <HoverCardContent 
              sideOffset={8}
              className="z-999 p-0 border border-white shadow-xl overflow-hidden min-w-0 w-auto"
              collisionPadding={20}>
              <Thumbnail 
                image={image} 
                size={600}
                className="h-auto w-auto aspect-auto max-w-100 max-h-100 border-0"/>
            </HoverCardContent>
          </HoverCard>
        </div>

        {isIIIF && (
          <IIIFIcon
            light
            className="iiif-logo text-white transition-all absolute bottom-1.5 left-1.5 size-4" />
        )}
        
        <div className="grow line-clamp-3 overflow-hidden text-ellipsis text-left">
          <div className="py-1 space-y-1">
            <div className="whitespace-nowrap truncate">{image.name}</div>
            {props.annotations > 0 && (
              <div className="flex gap-1 items-center text-muted-foreground">
                <MessagesSquare className="size-3.5" /> {props.annotations}
              </div>
            )}
          </div>
        </div>
      </button>
    </li>
  )

}