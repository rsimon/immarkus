import { MessagesSquare } from 'lucide-react';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource } from '@/model';

interface FolderListItemProps {

  annotations: number;

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
            className="iiif-logo text-white transition-all absolute top-8.5 left-1.5 size-4" />
        )}

        <div className="py-1 space-y-1">
          <div>{props.folder.name}</div>
          {props.annotations > 0 && (
            <div className="flex gap-1 items-center text-muted-foreground">
              <MessagesSquare className="size-3.5" /> {props.annotations}
            </div>
          )}
        </div>
      </button>
    </li>
  )

}