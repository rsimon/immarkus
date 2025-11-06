import { 
  DropdownMenuItem,
  DropdownMenuPortal, 
  DropdownMenuSeparator, 
  DropdownMenuSub, 
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/ui/DropdownMenu';
import { Share2 } from 'lucide-react';

export const IIIFOpenInViewerAction = () => {

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Share2 className="size-4 text-muted-foreground mr-2"  /> Other IIIF Viewers
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Clover</DropdownMenuItem>
          <DropdownMenuItem>Glycerine</DropdownMenuItem>
          <DropdownMenuItem>liiive.now</DropdownMenuItem>
          <DropdownMenuItem>Mirador</DropdownMenuItem>
          <DropdownMenuItem>Theseus Viewer</DropdownMenuItem>
          <DropdownMenuItem>Universal Viewer</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Copy manifest URL</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )

}