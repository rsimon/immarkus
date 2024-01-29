import { Link } from 'react-router-dom';
import { Image } from '@/model';
import { Info, MoreVertical, PanelTop } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface ImageActionProps {

  className?: string;

  image: Image;

  onSelect(): void;

}

export const ImageItemActions = (props: ImageActionProps) => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="image-actions-trigger absolute bottom-2 right-1">
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onSelect={props.onSelect}>
          <Info className="h-4 w-4 text-muted-foreground mr-2" /> Image metadata
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to={`/annotate/${props.image.id}`}>
            <PanelTop className="h-4 w-4 text-muted-foreground mr-2" />Open image
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )


}