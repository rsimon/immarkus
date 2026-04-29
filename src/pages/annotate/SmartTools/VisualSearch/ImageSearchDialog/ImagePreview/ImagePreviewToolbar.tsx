import { useState } from 'react';
import { ImageUp, Square, SquareCheckBig, X, ZoomIn, ZoomOut } from 'lucide-react';
import { ImageAnnotation, useViewer } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { Separator } from '@/ui/Separator';
import { cn } from '@/ui/utils';

interface ImagePreviewToolbarProps {

  isAllSelected: boolean;

  isClosable: boolean;

  selected: ImageAnnotation[];

  onImportSelected(): void;

  onClosePreview(): void;

  onClickSelectAll(): void;

}

export const ImagePreviewToolbar = (props: ImagePreviewToolbarProps) => {

  const { selected } = props;

  const viewer = useViewer();

  // When closing the preview, the search result UI takes noticably long
  // to render. We want to provide immediate feedback!
  const [isClosing, setIsClosing] = useState(false);

  const onClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsClosing(false), 500);
    setTimeout(() => props.onClosePreview(), 10);
  }

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

        <Separator 
          orientation="vertical" 
          className="h-4 opacity-35" />

        <button 
          className="flex gap-1.5 text-xs items-center rounded p-2 hover:bg-white/25"
          onClick={props.onClickSelectAll}>
          {props.isAllSelected ? (
            <SquareCheckBig className="size-4" /> 
          ) : (
            <Square className="size-4" /> 
          )} Select All
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
            'Import Selected Annotations'
          ) : (
            `Import ${selected.length.toLocaleString()} Annotation${selected.length > 1 ? 's' : ''}`
          )}
        </Button>

        {props.isClosable && (
          <button 
            disabled={isClosing}
            className="rounded p-2 hover:bg-white/25 disabled:opacity-50"
            onClick={onClose}>
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )

}