import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import murmur from 'murmurhash';
import { FolderOpen, ImageIcon, MoreHorizontal, NotebookPen } from 'lucide-react';
import { CozyRange } from 'cozy-iiif';
import { IIIFManifestResource } from '@/model';
import { Button } from '@/ui/Button';
import { CanvasItem } from '../../Types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface IIIFManifestTableRowActionsProps {

  manifest: IIIFManifestResource;

  data: CanvasItem | CozyRange;

  onSelectCanvas(item: CanvasItem): void;
  
}

export const IIIFManifestTableRowActions = (props: IIIFManifestTableRowActionsProps) => {

  const isCanvas = 'type' in props.data && props.data.type === 'canvas';

  const url = useMemo(() => {
    if (isCanvas) {
      const { info } = props.data as CanvasItem;
      return `/annotate/iiif:${info.manifestId}:${info.id}`;
    } else {
      const range = props.data as CozyRange;
      const id = murmur.v3(range.id);
      return `/images/${props.manifest.id}@${id}`;
    }
  }, [props.data, isCanvas]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground">
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="start"
        sideOffset={0}
        collisionPadding={10}
        onClick={evt => evt.stopPropagation()}>
        {isCanvas && (
          <DropdownMenuItem onSelect={() => props.onSelectCanvas(props.data as CanvasItem)}>
            <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> Metadata
          </DropdownMenuItem>
        )}

        {isCanvas ? (
          <DropdownMenuItem asChild>
            <Link to={url}>
              <ImageIcon className="h-4 w-4 text-muted-foreground mr-2" /> Open image
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link to={url}>
              <FolderOpen className="h-4 w-4 text-muted-foreground mr-2" /> Open folder
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

}