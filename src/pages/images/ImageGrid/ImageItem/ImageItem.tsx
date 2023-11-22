import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { LoadedImage } from '@/model';
import { ImageItemActions } from './ImageItemActions';
import { useStore } from '@/store';

interface ImageItemProps {

  image: LoadedImage;

  onOpen(): void;

}

export const ImageItem = (props: ImageItemProps) => {

  const imageEl = useRef<HTMLImageElement>();

  const { image } = props;

  const store = useStore({ redirect: true });

  const [annotations, setAnnotations] = useState<number | undefined>();

  const [dimensions, setDimensions] = useState([0, 0]);

  useEffect(() => {
    store.countAnnotations(image.id).then(setAnnotations);
  }, []);

  const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.target as HTMLImageElement;
    setDimensions([naturalWidth, naturalHeight]);
  }

  return (
    <div>
      <div className="p-[5px]">
        <div 
          className="image-item cursor-pointer relative overflow-hidden rounded-md border w-[190px] h-[190px]"
          onClick={props.onOpen}>
          <img
            onLoad={onLoad}
            loading="lazy"
            src={URL.createObjectURL(image.data)}
            alt={image.name}
            className="h-auto w-auto object-cover transition-all aspect-square"
          />

          <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full">
            <div className="text-white text-sm">
              <MessagesSquare 
                size={18} 
                className="inline align-text-bottom mr-1" /> 
                {annotations || 0}
            </div>

            <div className="absolute bottom-0 right-2 text-white text-sm">
              <ImageItemActions image={image} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm pt-2 pl-2 max-w-[190px] overflow-hidden">
        <h3 
          className="overflow-hidden whitespace-nowrap text-ellipsis">
          {image.name}
        </h3>
        <p className="pt-1 text-xs text-muted-foreground">
          {dimensions[0]} x {dimensions[1]} 
        </p>
      </div>
    </div>
  )

}