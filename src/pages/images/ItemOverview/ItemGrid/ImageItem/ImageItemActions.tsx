import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon, Images, MoreVertical, NotebookPen } from 'lucide-react';
import { VisualSearchDebugAction } from '@/components/VisualSearchDebugAction';
import { LoadedFileImage } from '@/model';
import { IIIFExportAction, IIIFExportDialog } from '../../../IIIFExporter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface ImageItemActionProps {

  className?: string;

  image: LoadedFileImage;

  onSelect(): void;

  onOpen(): void;

  onAddToWorkspace(): void;

}

export const ImageItemActions = (props: ImageItemActionProps) => {

  const { t } = useTranslation('images');

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
            <NotebookPen className="size-4 text-muted-foreground mr-2" /> {t('common.metadata')}
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={props.onOpen}>
            <ImageIcon className="size-4 text-muted-foreground mr-2" /> {t('common.openImage')}
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={props.onAddToWorkspace}>
            <Images className="size-4 text-muted-foreground mr-2" /> {t('common.addToWorkspace')}
          </DropdownMenuItem>

          <IIIFExportAction onSelect={() => setIsIIIFExportOpen(true)} />

          <VisualSearchDebugAction 
            title={props.image.name}
            imageId={props.image.id} />
        </DropdownMenuContent>
      </DropdownMenu>

      <IIIFExportDialog 
        open={isIIIFExportOpen} 
        onOpenChange={setIsIIIFExportOpen} 
        item={props.image} />
    </>
  )

}