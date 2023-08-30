import { Link } from 'react-router-dom';
import { AnnotatedImage } from '@/model';
import { Download, MessagesSquare, MoreVertical, PanelTop, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu';

interface ImageActionProps {

  className?: string;

  image: AnnotatedImage;

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
        <DropdownMenuItem>
          <Link to={`/annotate/${props.image.name}`} >
            <PanelTop size={18} className="inline text-muted-foreground relative -top-px mr-2" />Open image
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Download size={18} className="inline text-muted-foreground relative -top-px mr-2" />Download annotations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )


}