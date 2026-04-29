import { Bookmark } from 'lucide-react';
import { LoadedImage } from '@/model';
import { ToolbarButton } from '../../ToolbarButton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface BookmarkWorkspaceProps {

  images: LoadedImage[];

}

export const BookmarkWorkspace = (props: BookmarkWorkspaceProps) => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        asChild
        disabled={props.images.length < 2}>
        <ToolbarButton
          tooltip="Saved workspaces">
          <Bookmark className="size-8 p-2" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={0}>
        <DropdownMenuItem>
          Save current workspace
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            disabled
            className="data-disabled:opacity-30">
            <span className="pr-2">Saved workspaces</span>
          </DropdownMenuSubTrigger>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}