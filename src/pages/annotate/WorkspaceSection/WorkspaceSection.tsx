import { Mosaic, MosaicContext, MosaicWindow, MosaicWindowContext } from 'react-mosaic-component';
import { PanelLeft, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Image } from '@/model';
import { Button } from '@/ui/Button';
import { Separator } from '@/ui/Separator';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../HeaderSection';

import 'react-mosaic-component/react-mosaic-component.css';

interface WorkspaceSectionProps {

  images: Image[];

  mode: ToolMode;

  tool: Tool;

  onSaving(): void;

  onSaved(): void;

  onSaveError(error: Error): void;

}

const createInitialValue= (list: string[], direction = 'row') => {
  const [first, ...rest] = list;
  return {
    direction,
    first,
    second: rest.length === 1 ? rest[0] : createInitialValue(rest, direction === 'row' ? 'column' : 'row')
  };
}

export const WorkspaceSection = (props: WorkspaceSectionProps) => {

  return (
    <section className="workspace flex-grow bg-muted">
      {props.images.length === 1 ? (
        <AnnotatableImage 
          image={props.images[0]} 
          mode={props.mode}
          tool={props.tool}
          onSaving={props.onSaving} 
          onSaved={props.onSaved}
          onSaveError={props.onSaveError} />
      ) : props.images.length > 1 ? (
        <Mosaic
          renderTile={(id, path) => (
            <MosaicWindow 
              path={path}
              className="text-xs"
              createNode={() => id}
              title={id}
              toolbarControls={(
                <>
                  <button>
                    <ZoomIn className="h-4 w-4 mr-2.5 text-muted-foreground hover:text-black" />
                  </button>

                  <button>
                    <ZoomOut className="h-4 w-4 mr-1.5 text-muted-foreground hover:text-black" />
                  </button>

                  <Separator orientation="vertical" className="h-4 ml-0.5 mr-1" />

                  <MosaicContext.Consumer>
                    {({ mosaicActions }) => (
                      <MosaicWindowContext.Consumer>
                        {({ mosaicWindowActions })  => (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 p-0 -mr-0.5 rounded-full text-muted-foreground hover:text-black"
                              onClick={() => mosaicWindowActions.split()}>
                              <PanelLeft className="h-4 w-4" />
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 p-0 rounded-full mr-1 text-muted-foreground hover:text-black"
                              onClick={() => mosaicActions.remove(path)}>
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
                image={props.images.find(i => i.id === id)} 
                mode={props.mode}
                tool={props.tool}
                onSaving={props.onSaving} 
                onSaved={props.onSaved}
                onSaveError={props.onSaveError} />
            </MosaicWindow>
          )}
          initialValue={createInitialValue(props.images.map(i => i.id))} />
      ) : undefined}
    </section>
  )

}