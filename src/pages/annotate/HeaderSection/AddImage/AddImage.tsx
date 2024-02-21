import { useMemo, useState } from 'react';
import { ArrowLeft, ImagePlus, Search } from 'lucide-react';
import { Thumbnail } from '@/components/Thumbnail';
import { FolderIcon } from '@/components/FolderIcon';
import { Folder, FolderItems, Image, RootFolder } from '@/model';
import { useStore } from '@/store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';

interface AddImageProps {

  current: Image[];

  onAddImage(image: Image): void;

}

export const AddImage = (props: AddImageProps) => {

  const store = useStore();

  const [open, setOpen] = useState(false);

  const openImages = useMemo(() => new Set(props.current.map(image => image.id)), [props.current]);
  
  const [currentFolder, setCurrentFolder] = useState<Folder | RootFolder>(store.getRootFolder());

  const [items, setItems] = useState<FolderItems>(store.getFolderContents(store.getRootFolder().handle));

  const onOpenFolder = (folder: Folder | RootFolder) => {
    setCurrentFolder(folder);
    console.log('setting items', folder);

    setItems(store.getFolderContents(folder.handle));
  }

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

      <PopoverContent 
        sideOffset={0}
        className="w-[400px] p-0 shadow-lg">
        <div className="px-0.5 py-2 mb-1 flex border-b items-center text-sm">
          <Search className="w-8 h-4 px-2 text-muted-foreground" />
          
          <input 
            autoFocus
            placeholder="Search..."
            className="relative top-[1px] py-1 outline-none px-0.5 flex-grow" />
        </div>
        
        {currentFolder.parent && (
          <div className="px-2">
            <button 
              className="flex w-full text-xs items-center p-2 rounded-md hover:bg-muted"
              onClick={() => onOpenFolder(store.getFolder(currentFolder.parent))}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              <div>
                {currentFolder.parent.name}
              </div>
            </button>
          </div>
        )}
        <div className="h-[420px] overflow-y-auto px-1.5 pb-2">
          <ul className="text-xs">
            {items.folders.map(folder => (
              <li key={folder.id} className="mt-0.5 py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
                <button 
                  className="flex gap-3 w-full items-start"
                  onClick={() => onOpenFolder(folder)}>
                  <FolderIcon className="w-14 h-14 -ml-[1px] drop-shadow-md" />
                  <div className="py-1">{folder.name}</div>
                </button>
              </li>
            ))}
            {items.images.map(image => (
              <li key={image.id} className="mt-0.5 py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
                <button 
                  disabled={openImages.has(image.id)}
                  className={`flex gap-3 w-full items-start ${openImages.has(image.id) ? 'opacity-60' : ''}`}
                  onClick={() => onAddImage(image)}>
                  <Thumbnail image={image} /> 
                  <div className="line-clamp-3 py-0.5 overflow-hidden text-ellipsis">
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