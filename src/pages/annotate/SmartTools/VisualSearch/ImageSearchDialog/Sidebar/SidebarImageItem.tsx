import { LoadedImage } from '@/model';
import { getImageColor, THIS_IMAGE_COLOR } from '../ImageSearchPalette';

interface SidebarImageItemProps {

  isQueryImage?: boolean;

  image: LoadedImage;

  matches: number;

  onOpenPreview(): void;

}

export const SidebarImageItem = (props: SidebarImageItemProps) => {
  
  const { image, isQueryImage } = props;

  const backgroundColor = isQueryImage ? THIS_IMAGE_COLOR : getImageColor(image.id);

  return (
    <div className="text-xs">
      <div className="flex items-end gap-2">
        <div 
          className="relative shrink-0"
          onClick={props.onOpenPreview}>
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
        </div>

        <div className="flex flex-col justify-center text-xs pb-px">
          {'data' in image ? image.name : image.canvas.getLabel()}
        </div>
      </div>
    </div>
  )

}