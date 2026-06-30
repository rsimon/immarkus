import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Images, MoreVertical, NotebookPen, Trash2 } from 'lucide-react';
import { IIIFManifestResource, IIIFResource } from '@/model';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { IIIFExportAction, IIIFExportDialog } from '../../../IIIFExporter';
import { IIIFOpenInViewerAction } from '../../IIIFOpenInViewerAction';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface IIIFManifestItemActionsProps {

  resource: IIIFResource;

  onDelete(): void;

  onSelect(): void;

}

export const IIIFManifestItemActions = (props: IIIFManifestItemActionsProps) => {

  const { t } = useTranslation('images');

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [isIIIFExportOpen, setIsIIIFExportOpen] = useState(false);

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
            <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> {t('common.metadata')}
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to={`/images/${props.resource.id}`}>
              <Images className="size-4 text-muted-foreground mr-2" /> {t('common.openManifest')}
            </Link>
          </DropdownMenuItem>

          <IIIFOpenInViewerAction manifest={props.resource as IIIFManifestResource} />

          <IIIFExportAction onSelect={() => setIsIIIFExportOpen(true)} />

          <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>          
            <Trash2 className="size-4 mr-2 mb-px text-red-700/70" />
            <span className="text-red-700 hover:text-red-700">{t('common.delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <IIIFExportDialog 
        open={isIIIFExportOpen} 
        onOpenChange={setIsIIIFExportOpen} 
        item={props.resource} />

      <ConfirmedDelete
        open={confirmDelete}
        message={t('common.confirmDeleteManifest')}
        onConfirm={props.onDelete}
        onOpenChange={setConfirmDelete} />
    </>
  )

}