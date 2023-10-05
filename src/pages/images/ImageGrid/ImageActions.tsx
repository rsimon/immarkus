import { Link } from 'react-router-dom';
import { Image } from '@/model';
import { Download, MoreVertical, PanelTop } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface ImageActionProps {

  className?: string;

  image: Image;

}

export const ImageActions = (props: ImageActionProps) => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="image-actions-trigger absolute bottom-2 right-1">
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link to={`/annotate/${props.image.id}`}>
            <PanelTop size={18} className="inline text-muted-foreground relative -top-px mr-2" />Open image
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )


}