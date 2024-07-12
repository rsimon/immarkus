import { Link } from 'react-router-dom';
import { ChevronLeft, MousePointer2, Redo2, RotateCcwSquare, RotateCwSquare, Undo2, ZoomIn, ZoomOut } from 'lucide-react';
import { useAnnotoriousManifold, useViewers } from '@annotorious/react-manifold';
import { Image, LoadedImage } from '@/model';
import { useStore } from '@/store';
import { Separator } from '@/ui/Separator';
import { PaginationWidget } from '../Pagination';
import { SavingState } from '../SavingState';
import { Tool, ToolMode } from '../Tool';
import { ToolbarButton } from '../ToolbarButton';
import { AddImage } from './AddImage';
import { ToolSelector } from './ToolSelector';
import { MoreToolsPanel } from './MoreToolsPanel';
import { useCollapsibleToolbar } from './useCollapsibleToolbar';

interface HeaderSectionProps {

  images: LoadedImage[];

  mode: ToolMode;

  tool: Tool;

  onAddImage(image: Image): void;

  onChangeImage(previous: Image, next: Image): void;

  onChangeTool(tool: Tool): void;

  onChangeMode(mode: ToolMode): void;

}

export const HeaderSection = (props: HeaderSectionProps) => {

  const viewers = useViewers();

  const manifold = useAnnotoriousManifold();

  const store = useStore();

  const osdToolsDisabled = props.images.length > 1;

  /** 
   * The toolbar has a 'collapsed mode', GDocs-style, 
   * which we'll enable as soon as it overflows.
   */
  const { ref, collapsed } = useCollapsibleToolbar();

  const onEnableDrawing = (tool?: Tool) => {
    if (tool)
      props.onChangeTool(tool);

    props.onChangeMode('draw');
  }

  const onRotate = (clockwise: boolean) => {
    const viewer = Array.from(viewers.values())[0];
    viewer.viewport.rotateBy(clockwise ? 90 : -90);
  }

  const onZoom = (factor: number) => () => {
    const viewer = Array.from(viewers.values())[0];
    viewer.viewport.zoomBy(factor);
  }

  const onUndo = () => {
    const anno = manifold.getAnnotator(props.images[0].id);
    anno.undo();
  }

  const onRedo = () => {
    const anno = manifold.getAnnotator(props.images[0].id);
    anno.redo();
  }

  const folder = store.getFolder(props.images[0].folder);

  const back = props.images.length === 1 
    ? `/images/${folder && ('id' in folder) ? folder.id : ''}`
    : '/images/';

  return (
    <section 
      ref={ref}
      className="toolbar relative border-b p-2 flex justify-between text-sm h-[46px]">
      <section className="toolbar-left flex gap-1 items-center">
        <div className="flex items-center">
          <Link className="font-semibold inline" to={back}>
            <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </Link>

          <span className="text-xs font-medium ml-0.5 whitespace-nowrap max-w-[320px] overflow-hidden text-ellipsis">
            {props.images.length === 1 ? props.images[0].name : 'Back to Gallery'}
          </span>
        </div>

        <SavingState.Indicator />
      </section>

      <section className="toolbar-right flex gap-1 items-center">
        {collapsed && (
          <>
            <MoreToolsPanel 
              images={props.images}
              osdToolsDisabled={osdToolsDisabled}
              onAddImage={props.onAddImage}
              onChangeImage={props.onChangeImage} 
              onRedo={onRedo}
              onRotate={onRotate}
              onUndo={onUndo} />

            <Separator orientation="vertical" className="h-4" />
          </>
        )}

        {!collapsed && (
          <>
            <AddImage 
              current={props.images} 
              onAddImage={props.onAddImage} />

            <Separator orientation="vertical" className="h-4" />

            <PaginationWidget 
              disabled={osdToolsDisabled}
              image={props.images[0]} 
              onChangeImage={props.onChangeImage} 
              onAddImage={props.onAddImage} />

            <Separator orientation="vertical" className="h-4" />

            <ToolbarButton
              disabled={osdToolsDisabled}
              onClick={() => onRotate(false)}>
              <RotateCcwSquare
                className="h-8 w-8 p-2" />
            </ToolbarButton>

            <ToolbarButton
              disabled={osdToolsDisabled}
              onClick={() => onRotate(true)}>
              <RotateCwSquare 
                className="h-8 w-8 p-2" />
            </ToolbarButton>
          </>
        )}

        <ToolbarButton 
          disabled={osdToolsDisabled}
          onClick={onZoom(2)}>
          <ZoomIn 
            className="h-8 w-8 p-2" />
        </ToolbarButton>

        <ToolbarButton 
          disabled={osdToolsDisabled}
          onClick={onZoom(0.5)}>
          <ZoomOut 
            className="h-8 w-8 p-2" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-4" />

        {!collapsed && (
          <>
            <ToolbarButton
              disabled={osdToolsDisabled}
              onClick={onUndo}>
              <Undo2 
                className="h-8 w-8 p-2" />
            </ToolbarButton>

            <ToolbarButton
              disabled={osdToolsDisabled}
              onClick={onRedo}>
              <Redo2
                className="h-8 w-8 p-2" />
            </ToolbarButton>
          </>
        )}

        <button 
          className="p-1.5 pr-2.5 flex items-center text-xs rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-selected={props.mode === 'move'}
          data-state={props.mode === 'move' ? 'active' : undefined}
          onClick={() => props.onChangeMode('move')}>
          <MousePointer2 className="h-4 w-4 mr-1" /> Move
        </button>

        <ToolSelector 
          tool={props.tool} 
          active={props.mode === 'draw'}
          onClick={() => onEnableDrawing()}
          onToolChange={onEnableDrawing} />
      </section>
    </section>
  )

}