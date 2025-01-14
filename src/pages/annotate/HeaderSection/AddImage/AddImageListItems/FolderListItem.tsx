import { FolderIcon } from '@/components/FolderIcon';
import { Folder, IIIFManifestResource } from '@/model';

interface FolderListItemProps {

  folder: Folder | IIIFManifestResource;

  onOpenFolder(): void;

}

export const FolderListItem = (props: FolderListItemProps) => {

  return (
    <li className="mt-0.5 py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
      <button 
        className="flex gap-3 w-full items-start"
        onClick={props.onOpenFolder}>
        <FolderIcon className="w-14 h-14 -ml-[1px] drop-shadow-md" />
        <div className="py-1">{props.folder.name}</div>
      </button>
    </li>
  )

}