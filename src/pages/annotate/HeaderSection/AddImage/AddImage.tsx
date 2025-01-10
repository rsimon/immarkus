import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ImagePlus, Search } from 'lucide-react';
import { useStore } from '@/store';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { useSearch } from './useSearch';
import { AddImageItem, isCanvasInformation, isFolder, isIIIManifestResource } from './Types';
import { FolderListItem, ImageListItem } from './AddImageListItems';
import { 
  CanvasInformation, 
  FileImage, 
  Folder, 
  IIIFManifestResource, 
  IIIFResource, 
  Image, 
  RootFolder 
} from '@/model';

interface AddImageProps {

  current: Image[];

  onAddImage(imageId: string): void;

}

export const AddImage = (props: AddImageProps) => {

  const store = useStore();

  const search = useSearch();

  const openImages = useMemo(() => new Set(props.current.map(image => image.id)), [props.current]);

  const [open, setOpen] = useState(false);

  const [currentFolder, setCurrentFolder] = useState<Folder | RootFolder | IIIFResource>(store.getRootFolder());

  const isRootLevel = !('canvases' in currentFolder) && !('parent' in currentFolder);

  const [query, setQuery] = useState<string>('');

  const [items, setItems] = useState<AddImageItem[]>([]);

  useEffect(() => {
    if (open) {
      // Initialize search with root folder options
      const root = store.getRootFolder();
      const { folders, iiifResources, images } = store.getFolderContents(root.handle);
      const items = [...folders, ...iiifResources, ...images] as AddImageItem[];
      setItems(items);
    } else {
      // Reset on close
      const root = store.getRootFolder();
      setCurrentFolder(root); 
      setItems([]);
      setQuery('');
    }
  }, [store, open, [...openImages].join('.')])


  const onOpenFolder = (folder: Folder | RootFolder | IIIFResource) => {
    setCurrentFolder(folder);

    if ('canvases' in folder) {
      setItems(folder.canvases);
    } else if ('handle' in folder) {
      const { folders, iiifResources, images } = store.getFolderContents(folder.handle);
      const items = [...folders, ...iiifResources, ...images] as AddImageItem[];
      setItems(items);
    }
  }

  const onGoBack = () => {
    const parent = ('uri' in currentFolder) 
      ? store.getFolder(currentFolder.folder)
      : currentFolder.parent ? store.getFolder(currentFolder.parent) : undefined;

    if (parent)
      onOpenFolder(parent);
  }

  const isOpen = (image: FileImage | CanvasInformation) => {
    if (isCanvasInformation(image)) {
      const id = `iiif:${image.manifestId}:${image.id}`;
      return openImages.has(id);
    } else {
      return openImages.has(image.id);
    }
  }

  const onAddImage = (image: FileImage | CanvasInformation) => {
    setOpen(false);

    if (isCanvasInformation(image)) {
      const id = `iiif:${image.manifestId}:${image.id}`;
      props.onAddImage(id);
    } else {
      props.onAddImage(image.id);
    }
  }

  useEffect(() => {
    /*
    if (query) {
      const items = search(query);

      const folders = items.filter(i => 'handle' in i) as Folder[];
      const images = items.filter(i => 'file' in i) as Image[];

      setItems({ folders, images, iiifResources: [] });
    } else {
      setItems(store.getFolderContents(currentFolder.handle));
    }
    */
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
        
        {!(isRootLevel || query) && (
          <div className="px-2">
            <button 
              className="flex w-full text-xs items-center p-2 rounded-md hover:bg-muted"
              onClick={onGoBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              <div>
                {'parent' in currentFolder 
                  ? currentFolder.parent.name 
                  : (currentFolder as IIIFManifestResource).folder.name}
              </div>
            </button>
          </div>
        )}

        <div className="max-h-[420px] overflow-y-auto px-2.5 pb-2">
          <ul className="text-xs">
            {items.map(item => 
              isFolder(item) || isIIIManifestResource(item) ? (
                <FolderListItem 
                  key={item.id} 
                  folder={item} 
                  onOpenFolder={() => onOpenFolder(item)} />
              ) : (
                <ImageListItem 
                  key={item.id} 
                  image={item} 
                  isOpen={isOpen(item)} 
                  onSelect={() => onAddImage(item)} />
              )
            )}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )

}