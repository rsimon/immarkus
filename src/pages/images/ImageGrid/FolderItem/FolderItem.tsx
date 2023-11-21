import { Folder as FolderIcon } from 'lucide-react';
import { Folder } from '@/model';

interface FolderItemProps {

  folder: Folder;

}

export const FolderItem = (props: FolderItemProps) => {

  return (
    <div>
      <div 
        className="folder-item cursor-pointer relative overflow-hidden rounded-md 
          border w-[200px] h-[200px] flex justify-center 
          items-center text-muted-foreground/30">
        <img src="/folder-1485.svg" 
          className="w-24 h-24 transition-all" />
      </div>

      <div className="flex justify-center">
        <h3
          className="text-sm leading-none pt-3 max-w-[200px] overflow-hidden text-ellipsis">
          {props.folder.name}
        </h3>
      </div>
    </div>
  )

}