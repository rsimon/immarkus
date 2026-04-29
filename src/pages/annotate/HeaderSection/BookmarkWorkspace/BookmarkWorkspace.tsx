import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { LoadedImage } from '@/model';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { ToolbarButton } from '../../ToolbarButton';
import { type WorkspaceBookmark, useWorkspaceBookmarks } from './useWorkspaceBookmarks';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/ui/Dialog';
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
  const navigate = useNavigate();

  const { 
    bookmarks, 
    isCurrentBookmarked, 
    bookmarkCurrentWorkspace,
    removeCurrentBookmark
  } = useWorkspaceBookmarks(props.images);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const onSaveBookmark = () => {
    const trimmed = workspaceName.trim();
    if (!trimmed) return;
    bookmarkCurrentWorkspace(trimmed);
    setWorkspaceName('');
    setDialogOpen(false);
  }

  const onOpenBookmark = (bookmark: WorkspaceBookmark) =>
    navigate(`/annotate/${bookmark.images.join('&')}`);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton
            tooltip="Saved workspaces">
            {isCurrentBookmarked ? (
              <BookmarkCheck className="size-8.5 p-2" />
            ) : (
              <Bookmark className="size-8.5 p-2" />
            )}
          </ToolbarButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="start"
          sideOffset={0}
          className="min-w-50">
          {isCurrentBookmarked ? (
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => removeCurrentBookmark()}>
              Remove bookmark
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() => setDialogOpen(true)}
              className="text-xs">
              Bookmark this workspace...
            </DropdownMenuItem>
          )}

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={bookmarks.length === 0}
              className="data-disabled:opacity-30 text-xs">
              <span className="pr-2">Open workspace</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent 
              className="min-w-50">
              {bookmarks.map(bookmark => (
                <DropdownMenuItem
                  key={bookmark.images.join(':')}
                  onSelect={() => onOpenBookmark(bookmark)}
                  className="text-xs">
                  {bookmark.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}>
        <DialogContent >
          <DialogHeader>
            <DialogTitle>Save workspace</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Workspace name"
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSaveBookmark()} />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>

            <Button 
              disabled={!workspaceName.trim()} 
              onClick={onSaveBookmark}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

}