import { useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Trash2 } from 'lucide-react';
import { LoadedImage } from '@/model';
import { WorkspaceBookmark } from '@/store';
import { Button } from '@/ui/Button';
import { Command, CommandInput, CommandItem, CommandList } from '@/ui/Command';
import { Input } from '@/ui/Input';
import { useOpenInAnnotationView } from '../../AnnotationViewState';
import { ToolbarButton } from '../../ToolbarButton';
import { useWorkspaceBookmarks } from './useWorkspaceBookmarks';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface BookmarkWorkspaceProps {

  images: LoadedImage[];

}

export const BookmarkWorkspace = (props: BookmarkWorkspaceProps) => {

  const { openInAnnotationView } = useOpenInAnnotationView();

  const { 
    bookmarks, 
    isCurrentBookmarked, 
    createBookmark,
    updateBookmark,
    removeCurrentBookmark
  } = useWorkspaceBookmarks(props.images);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const onSaveBookmark = () => {
    const trimmed = workspaceName.trim();
    if (!trimmed) return;
    createBookmark(trimmed);
    setWorkspaceName('');
    setDialogOpen(false);
  }

  const onUpdateBookmark = (bookmark: WorkspaceBookmark) => {
    updateBookmark(bookmark);
    setWorkspaceName('');
    setDialogOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton
            tooltip="Workspace bookmarks">
            {isCurrentBookmarked ? (
              <BookmarkCheck className="size-8.5 p-2" />
            ) : (
              <Bookmark className="size-8.5 p-2" />
            )}
          </ToolbarButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="min-w-50">
          {isCurrentBookmarked ? (
            <DropdownMenuItem
              className="text-xs items-center flex gap-1.5"
              onSelect={() => removeCurrentBookmark()}>
              <Trash2 className="size-3.5 mb-px" /> Delete bookmark
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={props.images.length === 0}
              onSelect={() => setDialogOpen(true)}
              className="text-xs items-center flex gap-1.5">
              <Bookmark className="size-3.5 mb-px" /> Save bookmark...
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {bookmarks.length === 0 ? (
            <div className="text-muted-foreground text-xs px-2 py-1.25 font-light text-center">
              No saved bookmarks
            </div>
          ) : bookmarks.map(bookmark => (
            <DropdownMenuItem
              key={bookmark.images.join(':')}
              onSelect={() => openInAnnotationView(bookmark.images)}
              className="text-xs pl-7 relative">
              {bookmark.current && (
                <Check className="absolute left-1.5 size-4" />
              )}
              {bookmark.name}
            </DropdownMenuItem>
          ))}        
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save current workspace</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="New bookmark name"
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSaveBookmark()} />

          {bookmarks.length > 0 && (
            <div className="space-y-4">
              <div className="text-muted-foreground text-xs font-light">– or update an existing bookmark –</div>

              <Command className="h-auto rounded-none">
                <div className="[&>div]:border [&>div]:rounded-t">
                  <CommandInput
                    className="h-9" />
                </div>

                <CommandList className="max-h-60 border px-1 border-t-0 rounded-b pb-1">
                  {bookmarks.map(bookmark => (
                    <CommandItem 
                      className="mt-1"
                      onSelect={() => onUpdateBookmark(bookmark)}>
                      {bookmark.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </div>
          )}

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