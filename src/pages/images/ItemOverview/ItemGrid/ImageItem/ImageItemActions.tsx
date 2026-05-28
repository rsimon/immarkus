import { ImageIcon, Images, MoreVertical, NotebookPen } from 'lucide-react';
import { VisualSearchDebugAction } from '@/components/VisualSearchDebugAction';
import { LoadedImage } from '@/model';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface ImageItemActionProps {

  className?: string;

  image: LoadedImage;

  onSelect(): void;

  onOpen(): void;

  onAddToWorkspace(): void;

}

export const ImageItemActions = (props: ImageItemActionProps) => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="item-actions-trigger absolute bottom-2 right-1">
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={props.onSelect}>
          <NotebookPen className="size-4 text-muted-foreground mr-2" /> Metadata
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={props.onOpen}>
          <ImageIcon className="size-4 text-muted-foreground mr-2" /> Open image
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={props.onAddToWorkspace}>
          <Images className="size-4 text-muted-foreground mr-2" /> Add to workspace
        </DropdownMenuItem>

        <VisualSearchDebugAction 
          title={props.image.name}
          imageId={props.image.id} />
      </DropdownMenuContent>
    </DropdownMenu>
  )

}