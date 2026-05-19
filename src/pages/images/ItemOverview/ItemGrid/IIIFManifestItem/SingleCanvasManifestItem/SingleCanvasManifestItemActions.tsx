import { useState } from 'react';
import { Image, Images, MoreVertical, NotebookPen, Trash2 } from 'lucide-react';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { IIIFOpenInViewerAction } from '../../../IIIFOpenInViewerAction';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface SingleCanvasManifestItemActionsProps {

  manifest: IIIFManifestResource;

  canvas: CanvasInformation;

  onDelete(): void;

  onOpen(): void;

  onAddToWorkspace(): void;

  onSelectCanvas(): void;

  onSelectManifest(): void;

}

export const SingleCanvasManifestItemActions = (props: SingleCanvasManifestItemActionsProps) => {

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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> Metadata
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={props.onSelectManifest}>
                <Images className="size-4 text-muted-foreground mr-2" /> Manifest metadata
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={props.onSelectCanvas}>
                <Image className="size-4 text-muted-foreground mr-2" /> Canvas metadata
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onSelect={props.onOpen}>
            <Image className="size-4 text-muted-foreground mr-2" /> Open canvas
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={props.onAddToWorkspace}>
            <Images className="size-4 text-muted-foreground mr-2" /> Add to workspace
          </DropdownMenuItem>

          <IIIFOpenInViewerAction manifest={props.manifest} />

          <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>          
              <Trash2 className="size-4 mr-2 mb-px text-red-700/70" />
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