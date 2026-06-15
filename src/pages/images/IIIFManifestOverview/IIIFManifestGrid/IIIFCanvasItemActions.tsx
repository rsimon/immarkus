import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Images, MoreVertical, NotebookPen } from 'lucide-react';
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

  onOpen(): void;

  onAddToWorkspace(): void;

}

export const IIIFCanvasItemActions = (props: IIIFCanvasItemActionsProps) => {

  const { t } = useTranslation('images');

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
          <NotebookPen className="h-4 w-4 text-muted-foreground mr-2" /> {t('common.metadata')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={props.onOpen}>
          <Image className="size-4 text-muted-foreground mr-2" /> {t('common.openCanvas')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={props.onAddToWorkspace}>
          <Images className="size-4 text-muted-foreground mr-2" /> {t('common.addToWorkspace')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}