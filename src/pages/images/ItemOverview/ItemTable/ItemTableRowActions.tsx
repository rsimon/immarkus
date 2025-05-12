import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, ImageIcon, Images, MoreHorizontal, NotebookPen, Trash2 } from 'lucide-react';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { Folder, IIIFManifestResource, Image } from '@/model';
import { useStore } from '@/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';
import { Button } from '@/ui/Button';

interface ItemTableRowActions {

  data: Folder | IIIFManifestResource | Image;

  onOpenFolder(folder: Folder): void;

  onSelectFolder(folder: Folder): void;

  onSelectImage(image: Image): void;

  onSelectManifest(manifest: IIIFManifestResource): void;

}

export const ItemTableRowActions = (props: ItemTableRowActions) => {

  const store = useStore();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [isManifest, isImage, isFolder] = useMemo(() => {
    if ('canvases' in props.data) {
      return [true, false, false];
    } else if ('file' in props.data) {
      return [false, true, false];
    } else {
      return [false, false, true];
    }
  }, [props.data]);

  const onSelect = () => {
    if (isManifest)
      props.onSelectManifest(props.data as IIIFManifestResource);
    else if (isImage)
      props.onSelectImage(props.data as Image);
    else
      props.onSelectFolder(props.data as Folder);
  }

  const onDeleteManifest = () => store.removeIIIFResource(props.data as IIIFManifestResource);

  return (
    <>
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
          collisionPadding={10}>
          <DropdownMenuItem onSelect={onSelect}>
            <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> Metadata
          </DropdownMenuItem>

          {isImage ? (
            <DropdownMenuItem asChild>
              <Link to={`/annotate/${props.data.id}`}>
                <ImageIcon className="h-4 w-4 text-muted-foreground mr-2" /> Open image
              </Link>
            </DropdownMenuItem>
          ) : isFolder ? (
            <DropdownMenuItem asChild>
              <Link to={`/images/${props.data.id}`}>
                <FolderOpen className="h-4 w-4 text-muted-foreground mr-2" /> Open folder
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link to={`/images/${props.data.id}`}>
                <Images className="size-4 text-muted-foreground mr-2" /> Open Manifest
              </Link>
            </DropdownMenuItem>
          )}

          {isManifest && (
            <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>          
                <Trash2 className="size-4 mr-2 mb-[1px] text-red-700/70" />
                <span className="text-red-700 hover:text-red-700">Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        message="This will remove the manifest and will permanently delete all annotations from your computer."
        onConfirm={onDeleteManifest}
        onOpenChange={setConfirmDelete} />
    </>
  )

}