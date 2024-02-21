import { useMemo, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { FolderItems, Image } from '@/model';
import { useStore } from '@/store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';
import { Thumbnail } from '@/components/Thumbnail';

interface AddImageProps {

  current: Image[];

  onAddImage(image: Image): void;

}

export const AddImage = (props: AddImageProps) => {

  const store = useStore();

  const [open, setOpen] = useState(false);

  const [filtered, setFiltered] = useState<FolderItems>(store.getFolderContents(store.getRootFolder().handle));

  const addedImages = useMemo(() => new Set(props.current.map(image => image.id)), [props.current]);

  const onAddImage = (image: Image) => {
    setOpen(false);
    props.onAddImage(image);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="p-2 flex items-center text-xs rounded-md hover:bg-muted focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <ImagePlus className="h-4 w-4 mr-1" /> Add image
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0">
        <div>
          <input></input>
        </div>
        <div className="h-[420px] overflow-y-auto p-2">
          <ul>
            {filtered.images.map(image => (
              <li key={image.id} className="mt-0.5 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <button 
                  disabled={addedImages.has(image.id)}
                  className={`flex gap-3 items-start text-xs ${addedImages.has(image.id) ? 'opacity-60' : ''}`}
                  onClick={() => onAddImage(image)}>
                  <Thumbnail image={image} /> 
                  <div className="line-clamp-3 overflow-hidden text-ellipsis">
                    {image.name}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )

}