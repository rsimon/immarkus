import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Images, MoreVertical, NotebookPen } from 'lucide-react';
import { CanvasInformation } from '@/model';
import { CozyCanvas } from 'cozy-iiif';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface IIIFCanvasItemActionsProps {

  canvas: CozyCanvas;

  canvasInfo: CanvasInformation;

  onSelect(): void;

}

export const IIIFCanvasItemActions = (props: IIIFCanvasItemActionsProps) => {

  const info = props.canvasInfo;

  const url = useMemo(() => {
    return `/annotate/iiif:${info.manifestId}:${info.id}`;
  }, [info]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="item-actions-trigger absolute bottom-2 right-1">
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={props.onSelect}>
          <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> Metadata
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to={url}>
            <Images className="size-4 text-muted-foreground mr-2" /> Open Canvas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}