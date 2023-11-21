import { ImagePlus } from 'lucide-react';
import { Image } from '@/model';
import { useStore } from '@/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface AddImageProps {

  current: Image[];

  onAddImage(image: Image): void;

}

export const AddImage = (props: AddImageProps) => {

  // const store = useStore({ redirect: true });

  // const { images } = store;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <ImagePlus className="h-4 w-4 mr-1" /> Add image
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {/* 
        {images.map(image => (
          <DropdownMenuItem 
            key={image.id}
            disabled={props.current.includes(image)}
            onSelect={() => props.onAddImage(image)}>
            {image.name}
          </DropdownMenuItem>
        ))}
        */}
      </DropdownMenuContent>
    </DropdownMenu>
  )

}