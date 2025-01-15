import { useMemo } from 'react';
import { MessagesSquare } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Canvas } from '@iiif/presentation-3';
import { getCanvasLabel, getThumbnail } from '@/utils/iiif/lib/helpers';

interface IIIFCanvasItemProps {

  annotationCount: number;

  canvas: Canvas;

  selected?: boolean;

  onOpen(): void;

}

export const IIIFCanvasItem = (props: IIIFCanvasItemProps) => {

  const { canvas } = props;

  const { ref, inView } = useInView();
  
  const src = useMemo(() => getThumbnail(props.canvas), [props.canvas]);

  return (
    <div ref={ref}>
      <div className="flex items-center justify-center w-[180px] h-[200px]">
        <div 
          data-selected={props.selected ? true : undefined}
          className="data-[selected]:outline outline-2 outline-offset-2 image-item cursor-pointer relative overflow-hidden rounded-md border w-[178px] h-[178px]">
          {inView ? (
            <img
              src={src}
              className="h-auto w-auto min-h-full min-w-full object-cover transition-all aspect-square" 
              onClick={props.onOpen} />
          ) :(
            <div className="h-full w-full bg-muted" />
          )}

          <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full pointer-events-auto">
            <div className="text-white text-sm">
              <MessagesSquare 
                size={18} 
                className="inline align-text-bottom mr-1" /> 
                {props.annotationCount}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm ml-1 pl-2 max-w-[190px] overflow-hidden">
        <h3 
          className="overflow-hidden whitespace-nowrap text-ellipsis">
          {getCanvasLabel(canvas)}
        </h3>
        <p className="pt-1 text-xs text-muted-foreground">
          {canvas.width} x {canvas.height}
        </p>
      </div>
    </div>
  );

}