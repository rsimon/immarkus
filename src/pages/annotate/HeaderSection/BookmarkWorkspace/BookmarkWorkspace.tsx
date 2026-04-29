import { Bookmark } from 'lucide-react';
import { LoadedImage } from '@/model';
import { ToolbarButton } from '../../ToolbarButton';
import { useSavedWorkspaces } from './useSavedWorkspaces';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSub, 
  DropdownMenuSubContent, 
  DropdownMenuSubTrigger, 
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface BookmarkWorkspaceProps {

  images: LoadedImage[];

}

export const BookmarkWorkspace = (props: BookmarkWorkspaceProps) => {

  const { savedWorkspaces, isCurrentSaved, saveCurrentWorkspace } = useSavedWorkspaces(props.images);

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
        <DropdownMenuItem
          disabled={isCurrentSaved}
          onSelect={() => saveCurrentWorkspace('foo')}>
          Save current workspace
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            disabled={savedWorkspaces.length === 0}
            className="data-disabled:opacity-30">
            <span className="pr-2">Saved workspaces</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            {savedWorkspaces.map(workspace => (
              <DropdownMenuItem
                key={workspace.images.join(':')}>
                {JSON.stringify(workspace)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}