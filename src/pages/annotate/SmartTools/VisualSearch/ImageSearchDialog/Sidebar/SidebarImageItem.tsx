import { LoadedImage } from '@/model';
import { getImageColor, THIS_IMAGE_COLOR } from '../ImageSearchPalette';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/ui/utils';

interface SidebarImageItemProps {

  isQueryImage?: boolean;

  isCurrentPreview: boolean;

  image: LoadedImage;

  matches: number;

  onTogglePreview(): void;

}

export const SidebarImageItem = (props: SidebarImageItemProps) => {
  
  const { image, isCurrentPreview, isQueryImage } = props;

  const backgroundColor = isQueryImage ? THIS_IMAGE_COLOR : getImageColor(image.id);

  return (
    <button 
      className="text-xs text-left block"
      onClick={props.onTogglePreview}>
      <div className="flex items-end gap-2">
        <div 
          className="relative shrink-0">
          <img
            loading="lazy"
            className="rounded size-14 object-cover"
            src={'data' in image ? URL.createObjectURL(image.data) : image.canvas.getThumbnailURL(120)}
            alt={image.name} />

          <div 
            className="size-5.5 rounded-full border border-white absolute left-0.75 bottom-0.75 flex items-center justify-center text-[10px] text-white font-semibold" 
            style={{ backgroundColor }}>
            {props.matches}
          </div> 

          <div 
            className={cn(
              'transition-opacity flex absolute inset-0 size-full bg-black/50 rounded items-center justify-center text-white',
              isCurrentPreview ? undefined : 'opacity-0 group-hover:opacity-100'
            )}>
            
            <Eye className={cn(
              'size-7',
              isCurrentPreview ? 'group-hover:hidden' : undefined
            )} strokeWidth={1.5} />
            
            <EyeOff className={cn(
              'size-7 hidden',
              isCurrentPreview ? 'group-hover:block' : undefined
            )} strokeWidth={1.5} /> 
          </div>
        </div>

        <div className="flex flex-col justify-center text-xs pb-px">
          {'data' in image ? image.name : image.canvas.getLabel()}
        </div>
      </div>
    </button>
  )

}