import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderOpen, MoreVertical, NotebookPen } from 'lucide-react';
import { Folder } from '@/model';
import { useStore } from '@/store';
import { canExportFolderAsIIIF } from '@/store/export/iiif/exportImageFolderToIIIF';
import { IIIFExportAction, IIIFExportDialog } from '../../../IIIFExporter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface FolderItemActionProps {

  className?: string;

  folder: Folder;

  onSelect(): void;

}

export const FolderItemActions = (props: FolderItemActionProps) => {

  const { t } = useTranslation('images');

  const store = useStore();

  const { canExport, nestedManifests } = useMemo(() => {
    // Should never happen
    if (!store) return { canExport: false, nestedManifests: 0 };
    return canExportFolderAsIIIF(props.folder, store)
  }, [props.folder, store]);

  const [isIIIFExportOpen, setIIIFExportOpen] = useState(false);

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
            <Link to={`/images/${props.folder.id}`}>
              <FolderOpen className="h-4 w-4 text-muted-foreground mr-2" /> {t('common.openFolder')}
            </Link>
          </DropdownMenuItem>

          <IIIFExportAction 
            disabled={!canExport}
            onSelect={() => setIIIFExportOpen(true)} />
        </DropdownMenuContent>
      </DropdownMenu>

      <IIIFExportDialog 
        open={isIIIFExportOpen} 
        onOpenChange={setIIIFExportOpen} 
        willSkipManifests={nestedManifests}
        item={props.folder} />
    </>
  )

}