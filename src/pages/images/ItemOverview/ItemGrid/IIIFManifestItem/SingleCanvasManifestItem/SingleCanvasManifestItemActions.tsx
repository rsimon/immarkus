import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Images, MoreVertical, NotebookPen, Trash2 } from 'lucide-react';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { VisualSearchDebugAction } from '@/components/VisualSearchDebugAction';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { IIIFOpenInViewerAction } from '../../../IIIFOpenInViewerAction';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface SingleCanvasManifestItemActionsProps {

  manifest: IIIFManifestResource;

  canvas: CanvasInformation;

  onDelete(): void;

  onOpen(): void;

  onAddToWorkspace(): void;

  onSelectCanvas(): void;

  onSelectManifest(): void;

}

export const SingleCanvasManifestItemActions = (props: SingleCanvasManifestItemActionsProps) => {
  const { t } = useTranslation('images');

  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const id = `iiif:${props.canvas.manifestId}:${props.canvas.id}`;

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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> {t('common.metadata')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={props.onSelectManifest}>
                <Images className="size-4 text-muted-foreground mr-2" /> {t('common.manifestMetadata')}
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={props.onSelectCanvas}>
                <Image className="size-4 text-muted-foreground mr-2" /> {t('common.canvasMetadata')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onSelect={props.onOpen}>
            <Image className="size-4 text-muted-foreground mr-2" /> {t('common.openCanvas')}
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={props.onAddToWorkspace}>
            <Images className="size-4 text-muted-foreground mr-2" /> {t('common.addToWorkspace')}
          </DropdownMenuItem>

          <IIIFOpenInViewerAction manifest={props.manifest} />

          <VisualSearchDebugAction
            imageId={id}
            title={props.canvas.name} />

          <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>          
              <Trash2 className="size-4 mr-2 mb-px text-red-700/70" />
              <span className="text-red-700 hover:text-red-700">{t('common.delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        message={t('common.confirmDeleteManifest')}
        onConfirm={props.onDelete}
        onOpenChange={setConfirmDelete} />
    </>
  )

}