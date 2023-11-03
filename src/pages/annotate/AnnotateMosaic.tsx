import { Link, useParams } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { OpenSeadragonViewer } from '@annotorious/react';
import { Mosaic, MosaicContext, MosaicWindow, MosaicWindowContext } from 'react-mosaic-component';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Separator } from '@/ui/Separator';
import { 
  ChevronDown,
  ChevronLeft, 
  Image, 
  ImagePlus, 
  MessagesSquare, 
  MousePointerSquare, 
  PanelLeft,
  Square,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

import './AnnotateMosaic.css';
import 'react-mosaic-component/react-mosaic-component.css';
import { AnnotationList } from './AnnotationList';
import { StoragePlugin } from './StoragePlugin';

const TITLE_MAP: Record<string, string> = {
  a: 'Left Window',
  b: 'Top Right Window',
  c: 'Bottom Right Window',
  new: 'New Window',
};

export const AnnotateMosaic = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  const image = store?.getImage(params.id!);

  return (
    <div className="page annotate h-full w-full">
      <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
        <section className="toolbar border-b p-2 flex justify-between text-sm h-[46px]">
          <section className="toolbar-left flex gap-1 items-center">
            <div className=" flex items-center">
              <Link className="font-semibold inline" to="/images">
                <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
                  <ChevronLeft className="h-5 w-5" />
                </div>
              </Link>

              <span className="text-xs font-medium mr-2 ml-0.5">
                {image?.name}
              </span>
            </div>
          </section>

          <section className="toolbar-right flex gap-1.5 items-center">
            <button className="p-2 flex text-xs rounded-md hover:bg-muted">
              <ImagePlus className="h-4 w-4 mr-1" /> Add image
            </button>

            <button className="pl-2.5 py-2 pr-2 flex items-center text-xs rounded-md hover:bg-muted border shadow-sm">
              <Square className="w-4 h-4 mr-1.5" />
              Rectangle
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
            
            {/* 
              <button className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
                <TriangleRight className="w-4 h-4 mr-1.5 -rotate-[10deg] mb-0.5" />
                Polygon
              </button>

              <button className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
                <Circle className="w-4 h-4 mr-1 scale-y-90 mb-0.5" />
                Ellipse
              </button>
            */}
          </section>
        </section>

        <section className="workspace flex-grow bg-muted">
          {image && (
            <Mosaic
              renderTile={(id, path) => (
                <MosaicWindow 
                  path={path}
                  className="text-xs"
                  createNode={() => 'new'}
                  title={image.name}
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

                  <OpenSeadragonViewer
                    className="osd-container"
                    options={{
                      tileSources: {
                        type: 'image',
                        url: URL.createObjectURL(image.data)
                      },
                      gestureSettingsMouse: {
                        clickToZoom: false
                      },
                      showNavigationControl: false,
                      crossOriginPolicy: 'Anonymous'
                    }} />
                </MosaicWindow>
              )}
              initialValue={{
                direction: 'row',
                first: 'a',
                second: {
                  direction: 'column',
                  first: 'b',
                  second: 'c',
                },
              }} />
          )}
        </section>
      </main>

      <aside className="absolute top-0 right-0 h-full w-[340px] flex flex-col">
        <Tabs.Root asChild defaultValue="selection">
          <>
            <section className="toolbar border-b h-[46px] flex items-center">
              <Separator orientation="vertical" className="h-4" />

              <Tabs.List className="flex gap-1.5 py-0.5 px-2">
                <Tabs.Trigger value="selection" className="p-2 flex text-xs rounded-md bg-black text-white">
                  <MousePointerSquare className="h-4 w-4 mr-1" /> Selection
                </Tabs.Trigger>

                <Tabs.Trigger value="annotation-list" className="p-2 flex text-xs rounded-md hover:bg-muted text-muted-foreground">
                  <MessagesSquare className="h-4 w-4 mr-1" /> List
                </Tabs.Trigger>

                <Tabs.Trigger value="image-notes" className="p-2 flex text-xs rounded-md hover:bg-muted text-muted-foreground">
                  <Image className="h-4 w-4 mr-1" /> Image Notes
                </Tabs.Trigger>
              </Tabs.List>
            </section>

            <section className="sidebar-content bg-muted/80 flex flex-grow border-l">
              <Tabs.Content value="selection" asChild>
                <div className="flex flex-grow text-sm justify-center items-center w-full text-muted-foreground">
                  No annotation selected
                </div> 
              </Tabs.Content>

              <Tabs.Content value="annotation-list" asChild>
                <div className="flex flex-grow text-sm justify-center items-center w-full text-muted-foreground">
                  Annotation List
                </div> 
              </Tabs.Content>

              <Tabs.Content value="image-notes" asChild>
                <div className="flex flex-grow text-sm justify-center items-center w-full text-muted-foreground">
                  Image Notes
                </div> 
              </Tabs.Content>
            </section>
          </>
        </Tabs.Root>
      </aside>
    </div>
  )

}