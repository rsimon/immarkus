import { MosaicContext, MosaicRootActions, MosaicWindow, MosaicWindowContext } from 'react-mosaic-component';
import { MosaicBranch, MosaicKey } from 'react-mosaic-component/lib/types';
import { Redo2, RotateCcwSquare, RotateCwSquare, Undo2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Image, LoadedImage } from '@/model';
import { Button } from '@/ui/Button';
import { Separator } from '@/ui/Separator';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../Tool';
import { useAnnotator, useViewers } from '@annotorious/react-manifold';
import { PaginationWidget } from '../Pagination';

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

export const WorkspaceWindow = (props: WorkspaceWindowProps) => {

  const viewers = useViewers();

  const anno = useAnnotator(props.image.id);

  const onCloseWindow = (
    actions: MosaicRootActions<MosaicKey>
  ) => () => {
    actions.remove(props.windowPath);
    props.onClose();
  }

  const onRotate = (clockwise: boolean) => () => {
    const viewer = viewers.get(props.windowId);
    viewer.viewport.rotateBy(clockwise ? 90 : -90);
  }

  const onZoom = (factor: number) => () => {
    const viewer = viewers.get(props.windowId);
    viewer.viewport.zoomBy(factor);
  }

  return (
    <MosaicWindow 
      path={props.windowPath}
      className="text-xs"
      createNode={() => props.windowId}
      title={props.image.name}
      toolbarControls={(
        <>
          <button onClick={onRotate(false)}>
            <RotateCcwSquare className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
          </button>

          <button onClick={onRotate(true)}>
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

          <Separator orientation="vertical" className="h-4 mr-0.5" />

          <MosaicContext.Consumer>
            {({ mosaicActions }) => (
              <MosaicWindowContext.Consumer>
                {({ mosaicWindowActions })  => (
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
        </>
      )}>

      <AnnotatableImage 
        windowId={props.windowId}
        image={props.image} 
        mode={props.mode}
        tool={props.tool} />
    </MosaicWindow>
  )

}