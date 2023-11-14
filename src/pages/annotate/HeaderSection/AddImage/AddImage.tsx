import { Image } from '@/model';
import { useStore } from '@/store';
import { ImagePlus } from 'lucide-react';

interface AddImageProps {

  current: Image[];

  onAddImage(image: Image): void;

}

export const AddImage = (props: AddImageProps) => {

  const store = useStore();

  const onAddImage = () => {
    const rndIdx = Math.floor(Math.random() * (store.images.length));
    const dummy = store.images[rndIdx];

    const updated = Array.from(new Set([...props.current.map(i => i.id), dummy.id]));

    if (updated.length !== props.current.length)
      props.onAddImage(dummy);
  }

  return (
    <button 
      className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={onAddImage}>
      <ImagePlus className="h-4 w-4 mr-1" /> Add image
    </button>
  )

}