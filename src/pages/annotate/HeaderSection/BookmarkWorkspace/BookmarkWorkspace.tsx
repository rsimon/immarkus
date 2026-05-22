import { useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Trash2 } from 'lucide-react';
import { LoadedImage } from '@/model';
import { WorkspaceBookmark } from '@/store';
import { Button } from '@/ui/Button';
import { Command, CommandInput, CommandItem, CommandList } from '@/ui/Command';
import { Input } from '@/ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Separator } from '@/ui/Separator';
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

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const close = () => {
    setWorkspaceName('');
    setPopoverOpen(false);
    setDialogOpen(false);
  }

  const onSaveBookmark = () => {
    const trimmed = workspaceName.trim();
    if (!trimmed) return;
    createBookmark(trimmed);
    close();
  }

  const onDeleteBookmark = () => {
    removeCurrentBookmark();
    close();
  }

  const onOpenBookmark = (bookmark: WorkspaceBookmark) => {
    openInAnnotationView(bookmark.images)
    close();
  }

  const onUpdateBookmark = (bookmark: WorkspaceBookmark) => {
    updateBookmark(bookmark);
    close();
  }

  return (
    <>
      <Popover
        open={popoverOpen}
        onOpenChange={open => setPopoverOpen(open)}>
        <PopoverTrigger asChild>
          <ToolbarButton
            tooltip="Workspace bookmarks">
            {isCurrentBookmarked ? (
              <BookmarkCheck className="size-8.5 p-2" />
            ) : (
              <Bookmark className="size-8.5 p-2" />
            )}
          </ToolbarButton>
        </PopoverTrigger>

        <PopoverContent 
          className="min-w-50 w-auto p-0">
          <div className="p-1">
            {isCurrentBookmarked ? (
              <Button
                variant="ghost"
                onClick={() => onDeleteBookmark()}
                className="text-xs font-normal items-center justify-start disabled:hover:bg-transparent h-auto px-2 py-1.5 flex gap-1.5 w-full">
                <Trash2 className="size-3.5 mb-px" /> Delete current bookmark
              </Button>
            ) : (
              <Button
                variant="ghost"
                disabled={props.images.length === 0}
                onClick={() => setDialogOpen(true)}
                className="text-xs font-normal items-center justify-start disabled:hover:bg-transparent h-auto px-2 py-1.5 flex gap-1.5 w-full">
                <Bookmark className="size-3.5 mb-px" /> Save bookmark...
              </Button>
            )}
          </div>

          <Separator />

          <div className="p-1">
            {bookmarks.length === 0 ? (
              <div className="text-muted-foreground text-xs px-2 py-1.25 font-light text-center">
                No saved bookmarks
              </div>
            ) : (
              <Command className="rounded-none">
                <div className="rounded border m-0.5 [&>div]:border-0 bg-muted">
                  <CommandInput className="h-7" />
                </div>

                <CommandList className="p-0.5 pt-1">
                  {bookmarks.map(bookmark => (
                    <CommandItem
                      key={bookmark.images.join(':')}
                      onSelect={() => onOpenBookmark(bookmark)}
                      className="text-xs pl-7 relative">
                      {bookmark.current && (
                        <Check className="absolute left-1.5 size-4" />
                      )}
                      {bookmark.name}
                    </CommandItem>
                  ))} 
                </CommandList>
              </Command>
            )}      
          </div> 
        </PopoverContent>
      </Popover>

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
              <div className="text-muted-foreground text-xs font-light">– or overwrite an existing bookmark –</div>

              <Command className="h-auto rounded-none">
                <div className="[&>div]:border [&>div]:rounded-t">
                  <CommandInput className="h-9" />
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