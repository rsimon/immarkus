import { useState } from 'react';
import { LoadedImage } from '@/model';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Separator } from '@/ui/Separator';
import { PaginationWidget } from '../Pagination';
import { ToolbarButton } from '../ToolbarButton';
import { AnnotationMode } from '../AnnotationMode';
import { RelationEditor } from '../RelationEditor';
import { AddImage } from './AddImage';
import { CopyToClipboard } from './CopyToClipboard';
import { 
  EllipsisVertical,
  MessageCircleOff, 
  Redo2, 
  RotateCcwSquare, 
  RotateCwSquare, 
  Spline, 
  Undo2 
} from 'lucide-react';

const ENABLE_CONNECTOR_PLUGIN = import.meta.env.VITE_ENABLE_CONNECTOR_PLUGIN === 'true';

interface MoreToolsPanelProps {

  hideAnnotations: boolean;

  images: LoadedImage[];

  mode: AnnotationMode;

  osdToolsDisabled: boolean;

  relationsEditorOpen: boolean;

  onAddImage(imageId: string): void;

  onChangeImage(previousId: string, nextId: string): void;

  onChangeMode(props: AnnotationMode): void;

  onHideAnnotations(hide: boolean): void;

  onRelationsEditorOpenChange(open: boolean): void;

  onRedo(): void;

  onRotate(clockwise: boolean): void;

  onUndo(): void;

}

export const MoreToolsPanel = (props: MoreToolsPanelProps) => {

  const [open, setOpen] = useState(false);

  const onAddImage = (imageId: string) => {
    setOpen(false);
    props.onAddImage(imageId);
  }

  return (
    <Popover open={open}>
      <PopoverTrigger 
        onClick={() => setOpen(!open)}
        className="text-xs rounded-md hover:bg-muted focus-visible:outline-hidden 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-25 disabled:hover:bg-transparent">
        <EllipsisVertical
          className="h-8 w-8 p-2" />
      </PopoverTrigger>

      <PopoverContent className="w-auto p-1" sideOffset={10}>
        <section className="flex gap-1 items-center">
          <AddImage 
            current={props.images} 
            onAddImage={onAddImage} />

          <Separator orientation="vertical" className="h-4" />

          {props.images.length > 0 && (
            <PaginationWidget 
              disabled={props.osdToolsDisabled}
              image={props.images[0]} 
              onChangeImage={props.onChangeImage} 
              onAddImage={onAddImage} />
          )}

          <Separator orientation="vertical" className="h-4" />

          <ToolbarButton
            disabled={props.osdToolsDisabled}
            onClick={() => props.onRotate(false)}>
            <RotateCcwSquare
              className="h-8 w-8 p-2" />
          </ToolbarButton>

          <ToolbarButton
            disabled={props.osdToolsDisabled}
            onClick={() => props.onRotate(true)}>
            <RotateCwSquare 
              className="h-8 w-8 p-2" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-4" />

          <ToolbarButton
            disabled={props.osdToolsDisabled}
            onClick={props.onUndo}>
            <Undo2 
              className="h-8 w-8 p-2" />
          </ToolbarButton>

          <ToolbarButton
            disabled={props.osdToolsDisabled}
            onClick={props.onRedo}>
            <Redo2
              className="h-8 w-8 p-2" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-4" />

          <CopyToClipboard 
            images={props.images} />

          <ToolbarButton
            data-state={props.hideAnnotations ? 'active' : undefined}
            tooltip={`${props.hideAnnotations ? 'Show' : 'Hide'} annotations`}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            onClick={() => props.onHideAnnotations(!props.hideAnnotations)}>
            <MessageCircleOff className="size-8 p-2" />
          </ToolbarButton>       

          {ENABLE_CONNECTOR_PLUGIN ? (
            <button 
              className="pr-2.5 flex items-center text-xs rounded-md hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-selected={props.mode === 'relation'}
              data-state={props.mode === 'relation'}
              onClick={() => props.onChangeMode('relation')}>
              <Spline
                className="h-8 w-8 p-2" /> Connect
            </button>
          ) : (
            <RelationEditor 
              open={props.relationsEditorOpen}
              onOpenChange={props.onRelationsEditorOpenChange} />
          )}
        </section>
      </PopoverContent>
    </Popover>
  )

}