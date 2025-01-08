import { Link } from 'react-router-dom';
import { Images, MoreVertical } from 'lucide-react';
import { IIIFResource } from '@/model';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';


interface IIIFManifestItemActionsProps {

  resource: IIIFResource;

}

export const IIIFManifestItemActions = (props: IIIFManifestItemActionsProps) => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="item-actions-trigger absolute bottom-2 right-1">
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <Link to={`/images/${props.resource.id}`}>
            <Images className="h-4 w-4 text-muted-foreground mr-2" /> Open Manifest
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}