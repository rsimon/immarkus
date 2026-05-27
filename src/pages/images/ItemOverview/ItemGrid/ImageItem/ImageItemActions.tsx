import { useState } from 'react';
import { Bug, ImageIcon, Images, MoreVertical, NotebookPen } from 'lucide-react';
import { VisualSearchDebugDialog } from '@/components/VisualSearchDebugView';
import { LoadedImage } from '@/model';
import { useVisualSearchAvailable } from '@/pages/annotate/SmartTools/VisualSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface ImageItemActionProps {

  className?: string;

  image: LoadedImage;

  onSelect(): void;

  onOpen(): void;

  onAddToWorkspace(): void;

}

export const ImageItemActions = (props: ImageItemActionProps) => {

  const hasVisualSearch = useVisualSearchAvailable();

  const [showVisualSearchDebug, setShowVisualSearchDebug] = useState(false);

  const onOpenVSDebug = (e: Event) => {
    e.preventDefault();
    setShowVisualSearchDebug(true);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="item-actions-trigger absolute bottom-2 right-1">
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={props.onSelect}>
            <NotebookPen className="size-4 text-muted-foreground mr-2" /> Metadata
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={props.onOpen}>
            <ImageIcon className="size-4 text-muted-foreground mr-2" /> Open image
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={props.onAddToWorkspace}>
            <Images className="size-4 text-muted-foreground mr-2" /> Add to workspace
          </DropdownMenuItem>

          {hasVisualSearch && (
            <DropdownMenuItem onSelect={onOpenVSDebug}>
              <Bug className="size-4 text-muted-foreground mr-2" /> Inspect visual search index
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasVisualSearch && (
        <VisualSearchDebugDialog 
          image={props.image}
          open={showVisualSearchDebug}
          onOpenChange={setShowVisualSearchDebug} />
      )}
    </>
  )

}