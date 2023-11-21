import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { LoadedImage } from '@/model';
import { ImageItemActions } from './ImageItemActions';
import { useStore } from '@/store';

interface ImageItemProps {

  image: LoadedImage;

  onOpen(): void;

}

export const ImageItem = (props: ImageItemProps) => {

  const { image } = props;

  const store = useStore();

  const [annotations, setAnnotations] = useState<number | undefined>();

  useEffect(() => {
    store.countAnnotations(image.id).then(setAnnotations);
  }, []);

  return (
    <div 
      className="cursor-pointer relative overflow-hidden rounded-md border w-[200px] h-[200px]"
      onClick={props.onOpen}>
      <img
        loading="lazy"
        src={URL.createObjectURL(image.data)}
        alt={image.name}
        className="h-auto w-auto object-cover transition-all aspect-square"
      />

      <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full">
        <div className="text-white text-sm">
          <MessagesSquare 
            size={18} 
            className="inline align-text-bottom mr-0.5" /> 
            {annotations || 0}
        </div>

        <div className="absolute bottom-0 right-2 text-white text-sm">
          <ImageItemActions image={image} />
        </div>
      </div>
    </div>
  )

}