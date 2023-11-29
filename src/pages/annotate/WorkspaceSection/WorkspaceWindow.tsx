import { MosaicContext, MosaicRootActions, MosaicWindow, MosaicWindowContext } from 'react-mosaic-component';
import { MosaicBranch, MosaicKey } from 'react-mosaic-component/lib/types';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Image, LoadedImage } from '@/model';
import { Button } from '@/ui/Button';
import { Separator } from '@/ui/Separator';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../HeaderSection';
import { useViewers } from '@annotorious/react-manifold';
import { PaginationWidget } from '../Pagination';

interface WorkspaceWindowProps {

  windowId: string;

  windowPath: MosaicBranch[];

  image: LoadedImage;

  mode: ToolMode;

  tool: Tool;

  onChangeImage(previous: Image, next: Image): void;

  onClose(): void;

}

export const WorkspaceWindow = (props: WorkspaceWindowProps) => {

  const viewers = useViewers();

  const onCloseWindow = (
    actions: MosaicRootActions<MosaicKey>
  ) => () => {
    actions.remove(props.windowPath);
    props.onClose();
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
          <button onClick={onZoom(2)}>
            <ZoomIn className="h-4 w-4 mr-2.5 text-muted-foreground hover:text-black" />
          </button>

          <button onClick={onZoom(0.5)}>
            <ZoomOut className="h-4 w-4 mr-1.5 text-muted-foreground hover:text-black" />
          </button>

          <PaginationWidget
            image={props.image}
            variant="compact"
            onChangeImage={props.onChangeImage} />

          <Separator orientation="vertical" className="h-4 ml-0.5 mr-1" />

          <MosaicContext.Consumer>
            {({ mosaicActions }) => (
              <MosaicWindowContext.Consumer>
                {({ mosaicWindowActions })  => (
                  <>
                    {/*
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 p-0 -mr-0.5 rounded-full text-muted-foreground hover:text-black"
                      onClick={() => mosaicWindowActions.split()}>
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                    */}

                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 p-0 rounded-full mr-1 text-muted-foreground hover:text-black"
                      onClick={onCloseWindow(mosaicActions)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
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