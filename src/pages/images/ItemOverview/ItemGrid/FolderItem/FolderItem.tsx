import { useMemo } from 'react';
import { MessagesSquare } from 'lucide-react';
import { Folder } from '@/model';
import { useStore } from '@/store';
import { FolderIcon } from '@/components/FolderIcon';
import { FolderItemActions } from './FolderItemActions';
import { TruncatedLabel } from '../TruncatedLabel';

interface FolderItemProps {

  annotationCount: number;

  folder: Folder;

  onOpen(): void;

  onSelect(): void;

}

export const FolderItem = (props: FolderItemProps) => {

  const store = useStore();

  const { images, folders, iiifResources } = store.getFolderContents(props.folder.handle);

  const counts = useMemo(() => {
    const i = images.length;
    const f = folders.length;
    const m = iiifResources.length;

    if ((i + f + m) === 0) {
      return 'Empty';
    } else {
      const tokens = [
        i > 0 ? `${i} Image${i > 1 ? 's' : ''}` : undefined,
        m > 0 ? `${m} IIIF` : undefined,
        f > 0 ? `${f} Subfolder${f > 1 ? 's' : ''}` : undefined,
      ].filter(Boolean);

      return tokens.join(' · ')
    }
  }, [images.length, folders.length, iiifResources.length]);

  const isEmpty = (images.length + folders.length + iiifResources.length) === 0;

  return (
    <div>
      <div 
        className="folder-item cursor-pointer relative rounded-md 
          w-50 h-50 flex justify-center items-center">

        <button 
          onClick={props.onOpen}>
          <FolderIcon 
            className="scale w-47.5 h-47.5 transition-all drop-shadow-md" />
        </button>
        
        <div className="absolute bottom-3 px-3 pt-10 pb-3 left-1.5 w-full pointer-events-none">
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
        <div className="text-sm ml-1 max-w-47.5 overflow-hidden">
          <TruncatedLabel value={props.folder.name} />
          <p className="pt-1 text-xs text-muted-foreground">
            {counts}
          </p>
        </div>
      </div>
    </div>
  )

}