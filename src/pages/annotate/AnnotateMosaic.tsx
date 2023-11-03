import { Link } from 'react-router-dom';
import { ChevronLeft, Circle, Image, ImagePlus, MessagesSquare, MousePointerSquare, Square, TriangleRight } from 'lucide-react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import * as Tabs from '@radix-ui/react-tabs';

import './AnnotateMosaic.css';
import 'react-mosaic-component/react-mosaic-component.css';
import { Separator } from '@/ui/Separator';
import { Toggle } from '@/ui/Toggle';
import { Ellipse, Polygon, Rectangle } from '@/components/Icons';

const TITLE_MAP: Record<string, string> = {
  a: 'Left Window',
  b: 'Top Right Window',
  c: 'Bottom Right Window',
  new: 'New Window',
};

export const AnnotateMosaic = () => {

  return (
    <div className="page annotate h-full w-full">
      <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
        <section className="toolbar border-b p-1.5 flex justify-between text-sm h-[46px]">
          <section className="toolbar-left flex gap-1 items-center">
            <div className=" flex items-center">
              <Link className="font-semibold inline" to="/images">
                <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
                  <ChevronLeft className="h-5 w-5" />
                </div>
              </Link>

              <span className="text-xs font-medium mr-2 ml-0.5">
                RI_R_002_site position.png
              </span>
            </div>

            <button className="p-2 flex text-xs rounded-md bg-muted/70 hover:bg-gray-300/50">
              <ImagePlus className="h-4 w-4 mr-1" /> Add image
            </button>
          </section>

          <section className="toolbar-right flex gap-1.5 items-center">
            <button className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
              <Square className="w-4 h-4 mr-1" />
              Box
            </button>
            
            <button className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
              <TriangleRight className="w-4 h-4 mr-1.5 -rotate-[10deg] mb-0.5" />
              Polygon
            </button>

            <button className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
              <Circle className="w-4 h-4 mr-1 scale-y-90" />
              Ellipse
            </button>
          </section>
        </section>

        <section className="workspace flex-grow shadow-inner bg-muted" />
      </main>

      <aside className="absolute top-0 right-0 h-full w-[340px] flex flex-col">
        <Tabs.Root asChild>
          <section className="toolbar border-b h-[46px] flex items-center">
            <Separator orientation="vertical" className="h-4" />

            <Tabs.List className="flex gap-1.5 py-0.5 px-1">
              <Tabs.Trigger value="selection" className="p-2 flex text-xs rounded-md hover:bg-muted">
                <MousePointerSquare className="h-4 w-4 mr-1" /> Selection
              </Tabs.Trigger>

              <Tabs.Trigger value="annotation-list" className="p-2 flex text-xs rounded-md hover:bg-muted">
                <MessagesSquare className="h-4 w-4 mr-1" /> List
              </Tabs.Trigger>

              <Tabs.Trigger value="image-notes" className="p-2 flex text-xs rounded-md hover:bg-muted">
                <Image className="h-4 w-4 mr-1" /> Image Notes
              </Tabs.Trigger>
            </Tabs.List>
          </section>
        </Tabs.Root>

        <section className="sidebar-content bg-muted/80 flex-grow border-l">

        </section>
      </aside>
    </div>
  )

}