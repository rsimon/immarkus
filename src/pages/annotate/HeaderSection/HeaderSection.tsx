import { Link } from 'react-router-dom';
import { ChevronLeft, MousePointer2, ZoomIn, ZoomOut } from 'lucide-react';
import { useViewers } from '@annotorious/react-manifold';
import { Image, LoadedImage } from '@/model';
import { Tool, ToolSelector } from './ToolSelector';
import { Separator } from '@/ui/Separator';
import { SavingState } from '../SavingState';
import { AddImage } from './AddImage';
import { ToolbarButton } from './ToolbarButton';
import { PaginationWidget } from './Pagination';

interface HeaderSectionProps {

  images: LoadedImage[];

  mode: ToolMode;

  tool: Tool;

  onAddImage(image: Image): void;

  onChangeTool(tool: Tool): void;

  onChangeMode(mode: ToolMode): void;

}

export type ToolMode = 'move' | 'draw';

export const HeaderSection = (props: HeaderSectionProps) => {

  const viewers = useViewers();

  const onEnableDrawing = (tool?: Tool) => {
    if (tool)
      props.onChangeTool(tool);

    props.onChangeMode('draw');
  }

  const onZoom = (factor: number) => () => {
    const viewer = Array.from(viewers.values())[0];
    viewer.viewport.zoomBy(factor);
  }

  return (
    <section className="toolbar relative border-b p-2 flex justify-between text-sm h-[46px]">
      <section className="toolbar-left flex gap-1 items-center">
        <div className=" flex items-center">
          <Link className="font-semibold inline" to="/images">
            <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </Link>

          <span className="text-xs font-medium ml-0.5">
            {props.images.length === 1 ? props.images[0].name : 'Back to Gallery'}
          </span>
        </div>

        <SavingState.Indicator />
      </section>

      <section className="toolbar-right flex gap-1 items-center">
        <AddImage 
          current={props.images} 
          onAddImage={props.onAddImage} />

        <Separator orientation="vertical" className="h-4" />

        <ToolbarButton disabled={props.images.length > 1}>
          <ZoomIn 
            className="h-8 w-8 p-2" 
            onClick={onZoom(2)}/>
        </ToolbarButton>

        <ToolbarButton disabled={props.images.length > 1}>
          <ZoomOut 
            className="h-8 w-8 p-2" 
            onClick={onZoom(0.5)} />
        </ToolbarButton>

        <PaginationWidget 
          image={props.images[0]} />

        <button 
          className="p-2 pr-2.5 flex text-xs rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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