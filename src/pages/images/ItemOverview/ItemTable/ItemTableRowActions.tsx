import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderOpen, ImageIcon, Images, MoreHorizontal, NotebookPen, Trash2 } from 'lucide-react';
import { Button } from '@/ui/Button';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { VisualSearchDebugAction } from '@/components/VisualSearchDebugAction';
// import { FixRelocatedManifest } from '@/components/FixRelocatedManifest';
import { Folder, IIIFManifestResource, Image } from '@/model';
import { useStore } from '@/store';
import { isSingleImageManifest } from '@/utils/iiif';
import { useCanvas } from '@/utils/iiif/hooks';
import { OverviewItem } from '../../Types';
import { IIIFOpenInViewerAction } from '../IIIFOpenInViewerAction';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface ItemTableRowActions {

  data: Folder | IIIFManifestResource | Image;

  onOpenFolder(folder: Folder): void;

  onOpenImage(imageId: string): void;

  onAddToWorkspace(imageId: string): void;

  onSelectFolder(folder: Folder): void;

  onSelectImage(image: Image): void;

  onSelectItem(item: OverviewItem): void;

}

const SingleCanvasMetadataMenu = (props: ItemTableRowActions) => {

  const { t } = useTranslation('images');

  const info = (props.data as IIIFManifestResource).canvases[0];

  const id = `iiif:${info.manifestId}:${info.id}`;

  const canvas = useCanvas(id);

  const onSelectManifest = () =>
    props.onSelectItem(props.data as IIIFManifestResource);

  const onSelectCanvas = () =>
    props.onSelectItem({ type: 'canvas', info, canvas });

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> {t('common.metadata')}
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent>
        <DropdownMenuItem onSelect={onSelectManifest}>
          <Images className="size-4 text-muted-foreground mr-2" /> {t('common.manifestMetadata')}
        </DropdownMenuItem>

        {canvas && (
          <DropdownMenuItem onSelect={onSelectCanvas}>
            <ImageIcon className="size-4 text-muted-foreground mr-2" /> {t('common.canvasMetadata')}
          </DropdownMenuItem>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )

}

export const ItemTableRowActions = (props: ItemTableRowActions) => {

  const { t } = useTranslation('images');

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

  const isSingleCanvas = useMemo(() => (
    isManifest && isSingleImageManifest(props.data as IIIFManifestResource)
  ), [isManifest, props.data]);

  const onSelect = () => {
    if (isManifest) {
      props.onSelectItem(props.data as IIIFManifestResource);
    } else if (isImage) {
      props.onSelectImage(props.data as Image);
    } else {
      props.onSelectFolder(props.data as Folder);
    }
  }

  const imageId = useMemo(() => {
    if (isImage) {
      return props.data.id;
    } else if (isSingleCanvas) {
      const info = (props.data as IIIFManifestResource).canvases[0];
      return `iiif:${info.manifestId}:${info.id}`;
    }
  }, [isImage, isSingleCanvas, props.data]);

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
          collisionPadding={10}
          onClick={evt => evt.stopPropagation()}>
          {isSingleCanvas ? (
            <SingleCanvasMetadataMenu {...props} />
          ) : (
            <DropdownMenuItem onSelect={onSelect}>
              <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> {t('common.metadata')}
            </DropdownMenuItem>
          )}

          {isImage ? (
            <>
              <DropdownMenuItem onSelect={() => props.onOpenImage(imageId)}>
                <ImageIcon className="size-4 text-muted-foreground mr-2" /> {t('common.openImage')}
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => props.onAddToWorkspace(imageId)}>
                <Images className="size-4 text-muted-foreground mr-2" /> {t('common.addToWorkspace')}
              </DropdownMenuItem>

              <VisualSearchDebugAction
                imageId={imageId}
                title={props.data.name} />
            </>
          ) : isFolder ? (
            <DropdownMenuItem asChild>
              <Link to={`/images/${props.data.id}`}>
                <FolderOpen className="h-4 w-4 text-muted-foreground mr-2" /> {t('common.openFolder')}
              </Link>
            </DropdownMenuItem>
          ) : isSingleCanvas ? (
            <>
              <DropdownMenuItem onSelect={() => props.onOpenImage(imageId)}>
                <ImageIcon className="size-4 text-muted-foreground mr-2" /> {t('common.openCanvas')}
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => props.onAddToWorkspace(imageId)}>
                <Images className="size-4 text-muted-foreground mr-2" /> {t('common.addToWorkspace')}
              </DropdownMenuItem>

              <IIIFOpenInViewerAction manifest={props.data as IIIFManifestResource} />

              <VisualSearchDebugAction 
                imageId={imageId}
                title={props.data.name} />
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link to={`/images/${props.data.id}`}>
                  <Images className="size-4 text-muted-foreground mr-2" /> {t('common.openManifest')}
                </Link>
              </DropdownMenuItem>

              <IIIFOpenInViewerAction manifest={props.data as IIIFManifestResource} />
            </>
          )}

          {isManifest && (
            <>
              <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>          
                <Trash2 className="size-4 mr-2 mb-px text-red-700/70" />
                <span className="text-red-700 hover:text-red-700">{t('common.delete')}</span>
              </DropdownMenuItem>
              
              {/* <FixRelocatedManifest manifest={props.data as IIIFManifestResource}/> */}
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        message={t('common.confirmDeleteManifest')}
        onConfirm={onDeleteManifest}
        onOpenChange={setConfirmDelete} />
    </>
  )

}