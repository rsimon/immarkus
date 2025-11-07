import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource } from '@/model';

interface FolderListItemProps {

  folder: Folder | IIIFManifestResource;

  onOpenFolder(): void;

}

export const FolderListItem = (props: FolderListItemProps) => {

  const isIIIF = 'canvases' in props.folder;

  return (
    <li className="mt-0.5 py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
      <button 
        className="flex gap-3 w-full items-start relative text-left"
        onClick={props.onOpenFolder}>
        <FolderIcon
          className="w-14 h-14 -ml-px drop-shadow-md" />
        
        {isIIIF && (
          <IIIFIcon
            light
            className="iiif-logo text-white transition-all absolute bottom-1.5 left-1.5 size-4" />
        )}

        <div className="py-1">{props.folder.name}</div>
      </button>
    </li>
  )

}