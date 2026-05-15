import { Image } from '@/model';
import { ImageIcon, MoreVertical, NotebookPen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface ImageItemActionProps {

  className?: string;

  image: Image;

  onSelect(): void;

  onOpen(): void;

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
          <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> Metadata
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={props.onOpen}>
          <ImageIcon className="h-4 w-4 text-muted-foreground mr-2" /> Open image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}