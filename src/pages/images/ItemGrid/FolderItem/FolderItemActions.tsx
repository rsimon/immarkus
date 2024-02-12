import { Link } from 'react-router-dom';
import { Folder } from '@/model';
import { FolderIcon, Info, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface FolderItemActionProps {

  className?: string;

  folder: Folder;

  onSelect(): void;

}

export const FolderItemActions = (props: FolderItemActionProps) => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="item-actions-trigger absolute bottom-2 right-1">
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onSelect={props.onSelect}>
          <Info className="h-4 w-4 text-muted-foreground mr-2" /> Folder metadata
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to={`/images/${props.folder.id}`}>
            <FolderIcon className="h-4 w-4 text-muted-foreground mr-2" /> Open folder
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}