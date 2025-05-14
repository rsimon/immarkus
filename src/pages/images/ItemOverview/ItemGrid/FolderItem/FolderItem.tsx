import { MessagesSquare } from 'lucide-react';
import { Folder } from '@/model';
import { useStore } from '@/store';
import { FolderIcon } from '@/components/FolderIcon';
import { FolderItemActions } from './FolderItemActions';

interface FolderItemProps {

  annotationCount: number;

  folder: Folder;

  onOpen(): void;

  onSelect(): void;

}

export const FolderItem = (props: FolderItemProps) => {

  const store = useStore();

  const { images, folders } = store.getFolderContents(props.folder.handle);

  return (
    <div>
      <div 
        className="folder-item cursor-pointer relative rounded-md 
          w-[200px] h-[200px] flex justify-center items-center">

        <button 
          onClick={props.onOpen}>
          <FolderIcon 
            className="scale w-[190px] h-[190px] transition-all drop-shadow-md" />
        </button>
        
        <div className="absolute bottom-3 px-3 pt-10 pb-3 left-1.5 w-full pointer-events-auto">
          <div className="text-white text-sm">
            <MessagesSquare 
              size={18} 
              className="inline align-text-bottom mr-1" /> 
              {props.annotationCount.toLocaleString()}
          </div>

          <div className="absolute bottom-0.5 right-3 text-white text-sm pointer-events-auto">
            <FolderItemActions 
              folder={props.folder} 
              onSelect={props.onSelect} />
          </div>
        </div>
      </div>

      <div className="ml-2">
        <div>
          <h3
            className="text-sm max-w-[200px] overflow-hidden text-ellipsis">
            {props.folder.name}
          </h3>
          <p className="pt-1 text-xs text-muted-foreground">
            {images.length === 0 && folders.length === 0 ? 
                'Empty' : 
              images.length > 0 && folders.length > 0 ?
                `${images.length} Image${images.length > 1 ? 's' : ''} · ${folders.length} Subfolder${folders.length > 1 ? 's' : ''}` :
              images.length > 0 ?
                `${images.length} Image${images.length > 1 ? 's' : ''}` :
                `${folders.length} Subfolder${folders.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>
    </div>
  )

}