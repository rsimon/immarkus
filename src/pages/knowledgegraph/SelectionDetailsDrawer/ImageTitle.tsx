import { Image } from 'lucide-react';
import { LoadedImage } from '@/model';
import { cn } from '@/ui/utils';
import { useManifestLabel } from './useManifestLabel';

interface ImageTitleProps {

  image: LoadedImage;

}

export const ImageTitle = (props: ImageTitleProps) => {

  const manifestLabel = useManifestLabel(props.image);

  return (
    <h3 className="py-1 space-y-0.5 flex flex-col justify-center items-start">
      <div className={cn(
        'flex gap-1.5 pr-1 text-xs whitespace-nowrap overflow-hidden',
        manifestLabel ? 'items-start' : 'items-center'
        )}>
        <Image className="h-3.5 w-3.5" />
        <span className="overflow-hidden text-ellipsis">{props.image?.name}</span>
      </div>
      {manifestLabel && (
        <div className="text-xs font-normal">
          {manifestLabel}
        </div>
      )}
    </h3>
  )

}