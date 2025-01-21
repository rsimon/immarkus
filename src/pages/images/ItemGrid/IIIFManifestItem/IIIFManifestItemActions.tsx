import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Images, MoreVertical, NotebookPen, Trash2 } from 'lucide-react';
import { IIIFResource } from '@/model';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface IIIFManifestItemActionsProps {

  resource: IIIFResource;

  onDelete(): void;

  onSelect(): void;

}

export const IIIFManifestItemActions = (props: IIIFManifestItemActionsProps) => {

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="item-actions-trigger absolute bottom-2 right-1">
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={props.onSelect}>
            <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> Metadata
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to={`/images/${props.resource.id}`}>
              <Images className="size-4 text-muted-foreground mr-2" /> Open Manifest
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>          
              <Trash2 className="size-4 mr-2 mb-[1px] text-red-700/70" />
              <span className="text-red-700 hover:text-red-700">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        message="This will remove the manifest and will permanently delete all annotations from your computer."
        onConfirm={props.onDelete}
        onOpenChange={setConfirmDelete} />
    </>
  )

}