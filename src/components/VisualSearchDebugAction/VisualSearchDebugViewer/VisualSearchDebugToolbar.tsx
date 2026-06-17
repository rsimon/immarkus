import { useTranslation } from 'react-i18next';
import { ImageUp, ZoomIn, ZoomOut } from 'lucide-react';
import { ImageAnnotation, useViewer } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { cn } from '@/ui/utils';

interface VisualSearchDebugToolbarProps {

  selected: ImageAnnotation[];

  onImportSelected(): void;

}

export const VisualSearchDebugToolbar = (props: VisualSearchDebugToolbarProps) => {
  const { t } = useTranslation('common');

  const { selected } = props;

  const viewer = useViewer();

  const onZoom = (inc: number) => () => {
    viewer?.viewport.zoomBy(inc);
  }

  return (
    <div className="absolute bottom-4 left-0 w-full flex justify-center">
      <div className="bg-black text-white p-1.5 rounded-md shadow-md flex gap-2 items-center">
        <button 
          className="rounded p-2 hover:bg-white/25"
          onClick={onZoom(2)}>
          <ZoomIn className="size-4" />
        </button>

        <button 
          className="rounded p-2 hover:bg-white/25"
          onClick={onZoom(0.5)}>
          <ZoomOut className="size-4" />
        </button>

        <Button
          disabled={selected.length === 0}
          className={cn(
            'transition-all h-8 text-xs rounded-sm font-normal whitespace-nowrap ml-2 gap-2',
            selected.length === 0 ? 'bg-white/80 text-black/70' : 'bg-green-600'
          )}
          onClick={props.onImportSelected}>
          <ImageUp className="size-4" />
          {selected.length === 0 ? (
            t('visualSearchDebug.toolbar.importSelectedAnnotations')
          ) : (
            t('visualSearchDebug.toolbar.importAnnotations', { count: selected.length })
          )}
        </Button>
      </div>
    </div>
  )

}