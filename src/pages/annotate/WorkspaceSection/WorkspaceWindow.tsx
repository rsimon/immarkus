import { forwardRef, useImperativeHandle } from 'react';
import { MosaicContext, MosaicRootActions, MosaicWindow, MosaicWindowContext } from 'react-mosaic-component';
import { MosaicBranch, MosaicKey } from 'react-mosaic-component/lib/types';
import { useAnnotator, useViewers } from '@annotorious/react-manifold';
import { Redo2, RotateCcwSquare, RotateCwSquare, Undo2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Image, LoadedImage } from '@/model';
import { Button } from '@/ui/Button';
import { Separator } from '@/ui/Separator';
import { Tool, ToolMode } from '../Tool';
import { PaginationWidget } from '../Pagination';
import { AnnotatableImage } from './AnnotatableImage';
import { MoreToolsPanel } from './MoreToolsPanel';
import { useCollapsibleToolbar } from './useCollapsibleToolbar';

import './WorkspaceWindow.css';

interface WorkspaceWindowProps {

  windowId: string;

  windowPath: MosaicBranch[];

  image: LoadedImage;

  mode: ToolMode;

  tool: Tool;

  onAddImage(image: Image): void;

  onChangeImage(previous: Image, next: Image): void;

  onClose(): void;

}

export interface WorkspaceWindowRef {
  
  onResize: () => void;
  
}

export const WorkspaceWindow = forwardRef<WorkspaceWindowRef, WorkspaceWindowProps>((props, ref) => {

  const viewers = useViewers();

  const anno = useAnnotator(props.image.id);

  const { toolbarRef, collapsed, onResize } = useCollapsibleToolbar();

  const onCloseWindow = (
    actions: MosaicRootActions<MosaicKey>
  ) => () => {
    actions.remove(props.windowPath);
    props.onClose();
  }

  const onRotate = (clockwise: boolean) => {
    const viewer = viewers.get(props.windowId);
    viewer.viewport.rotateBy(clockwise ? 90 : -90);
  }

  const onZoom = (factor: number) => () => {
    const viewer = viewers.get(props.windowId);
    viewer.viewport.zoomBy(factor);
  }

  // Bit of a workaround, but allows us to collapse the toolbar in 
  // response to a change in the parent Mosaic grid.
  useImperativeHandle(ref, () => ({ onResize }));

  return (
    <MosaicWindow
      path={props.windowPath}
      className="text-xs"
      title={props.image.name}
      toolbarControls={(
        <div ref={toolbarRef} className="inline-flex flex-grow justify-end items-center">
          {collapsed ? (
            <>
              <button onClick={onZoom(2)}>
                <ZoomIn className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
              </button>

              <button onClick={onZoom(0.5)}>
                <ZoomOut className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
              </button>

              <MoreToolsPanel 
                image={props.image}
                onAddImage={props.onAddImage}
                onChangeImage={props.onChangeImage}
                onRedo={() => anno.redo()}
                onRotate={onRotate} 
                onUndo={() => anno.undo()}/>
            </>
          ) : (
            <>
              <button onClick={() => onRotate(false)}>
                <RotateCcwSquare className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
              </button>

              <button onClick={() => onRotate(true)}>
                <RotateCwSquare className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
              </button>

              <button onClick={onZoom(2)}>
                <ZoomIn className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
              </button>

              <button onClick={onZoom(0.5)}>
                <ZoomOut className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
              </button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <button onClick={() => anno.undo()}>
                <Undo2 className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
              </button>

              <button onClick={() => anno.redo()}>
                <Redo2 className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
              </button>

              <Separator orientation="vertical" className="h-4 ml-1" />

              <PaginationWidget
                image={props.image}
                variant="compact"
                onChangeImage={props.onChangeImage} 
                onAddImage={props.onAddImage} />
            </>
          )}

          <Separator orientation="vertical" className="h-4 mr-0.5" />

          <MosaicContext.Consumer>
            {({ mosaicActions }) => (
              <MosaicWindowContext.Consumer>
                {()  => (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 p-0 rounded-full mr-1 text-muted-foreground hover:text-black"
                    onClick={onCloseWindow(mosaicActions)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </MosaicWindowContext.Consumer>
            )}
          </MosaicContext.Consumer>
        </div>
      )}>

      <AnnotatableImage 
        windowId={props.windowId}
        image={props.image} 
        mode={props.mode}
        tool={props.tool} />
    </MosaicWindow>
  )

});