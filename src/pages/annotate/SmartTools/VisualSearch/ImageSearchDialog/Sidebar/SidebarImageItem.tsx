import { LoadedImage } from '@/model';
import { getImageColor, THIS_IMAGE_COLOR } from '../ImageSearchPalette';

interface SidebarImageItemProps {

  isQueryImage?: boolean;

  image: LoadedImage;

  matches: number;

}

export const SidebarImageItem = (props: SidebarImageItemProps) => {
  
  const { image, isQueryImage } = props;

  const backgroundColor = isQueryImage ? THIS_IMAGE_COLOR : getImageColor(image.id);

  return (
    <div className="text-xs">
      <div className="flex items-end gap-2">
        <div className="relative">
          <img
            loading="lazy"
            className="rounded size-12 object-cover"
            src={'data' in image ? URL.createObjectURL(image.data) : image.canvas.getThumbnailURL(120)}
            alt={image.name} />
        </div>

        <div className="flex flex-col justify-center">
          <span className="font-semibold">
            {'data' in image ? image.name : image.canvas.getLabel()}
          </span>
          <div className="text-muted-foreground flex gap-1 items-center">
            <div 
              className="size-2.5 rounded-full" 
              style={{ backgroundColor }} /> {props.matches} results
          </div>
        </div>
      </div>

    </div>
  )

}