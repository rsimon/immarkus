import { Folder } from '@/model';
import FolderIcon from './FolderIcon.svg';

interface FolderItemProps {

  folder: Folder;

  onOpen(): void;

}

export const FolderItem = (props: FolderItemProps) => {

  return (
    <div>
      <div 
        className="folder-item cursor-pointer relative rounded-md 
          border border-slate-400/20 shadow-sm w-[200px] h-[200px] flex justify-center 
          items-center bg-muted/80"
        onClick={props.onOpen}>

        <img 
          src={FolderIcon}
          alt={`Folder: ${props.folder.name}`}
          className="w-20 h-20 transition-all" />
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