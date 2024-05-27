import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ImagePlus, Search } from 'lucide-react';
import { Thumbnail } from '@/components/Thumbnail';
import { FolderIcon } from '@/components/FolderIcon';
import { Folder, FolderItems, Image, RootFolder } from '@/model';
import { useStore } from '@/store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';
import { useSearch } from './useSearch';

interface AddImageProps {

  current: Image[];

  onAddImage(image: Image): void;

}

export const AddImage = (props: AddImageProps) => {

  const store = useStore();

  const search = useSearch();

  const openImages = useMemo(() => new Set(props.current.map(image => image.id)), [props.current]);

  const isOpen = (image: Image) => openImages.has(image.id)

  const [open, setOpen] = useState(false);

  const [currentFolder, setCurrentFolder] = useState<Folder | RootFolder>(store.getRootFolder());

  const [query, setQuery] = useState<string>('');

  const [items, setItems] = useState<FolderItems>(store.getFolderContents(store.getRootFolder().handle));

  const onOpenFolder = (folder: Folder | RootFolder) => {
    setCurrentFolder(folder);
    setItems(store.getFolderContents(folder.handle));
  }

  const onAddImage = (image: Image) => {
    setOpen(false);
    props.onAddImage(image);
  }

  useEffect(() => {
    // Reset to root when closing
    if (!open) {
      const root = store.getRootFolder();
      setCurrentFolder(root); 
      setItems(store.getFolderContents(root.handle));
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (query) {
      const items = search(query);

      const folders = items.filter(i => 'handle' in i) as Folder[];
      const images = items.filter(i => 'file' in i) as Image[];

      setItems({ folders, images });
    } else {
      setItems(store.getFolderContents(currentFolder.handle));
    }
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="p-2 flex items-center text-xs rounded-md hover:bg-muted focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap">
        <ImagePlus className="h-4 w-4 mr-1" /> Add image
      </PopoverTrigger>

      <PopoverContent 
        sideOffset={0}
        className="w-[400px] p-0 shadow-lg">
        <div className="px-1 py-2 mb-2 flex border-b items-center">
          <Search className="w-8 h-4 px-2 text-muted-foreground" />
          
          <input 
            autoFocus
            placeholder="Search..."
            className="relative top-[1px] py-1 outline-none px-0.5 flex-grow text-sm" 
            value={query} 
            onChange={evt => setQuery(evt.target.value)} />
        </div>
        
        {currentFolder.parent && !query && (
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
        <div className="max-h-[420px] overflow-y-auto px-2.5 pb-2">
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
              <li 
                key={image.id} 
                className={`mt-0.5 py-2 px-3 rounded-lg cursor-pointer${isOpen(image) ?  '' : ' hover:bg-muted'}`}>
                <button 
                  disabled={isOpen(image)}
                  className="flex gap-3 w-full"
                  onClick={() => onAddImage(image)}>
                  {isOpen(image) ? (
                    <div className="relative">
                      <Thumbnail image={image} /> 
                      <div className="absolute w-full h-full top-0 left-0 bg-white/60 flex items-center justify-center">
                        <Check className="text-black h-10 w-10" />
                      </div>
                    </div>
                  ) : (
                    <Thumbnail image={image} /> 
                  )}
                  <div className="flex-grow line-clamp-3 overflow-hidden text-ellipsis text-left">
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