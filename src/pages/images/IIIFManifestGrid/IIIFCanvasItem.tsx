import { useMemo } from 'react';
import { MessagesSquare } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { CozyCanvas } from '@/utils/cozy-iiif';
import { getCanvasLabelWithFallback } from '@/utils/iiif';
import { CanvasInformation } from '@/model';
import { IIIFCanvasItemActions } from './IIIFCanvasItemActions';

interface IIIFCanvasItemProps {

  annotationCount: number;

  canvas: CozyCanvas;

  canvasInfo: CanvasInformation;

  selected?: boolean;

  onOpen(): void;

  onSelect(): void;

}

export const IIIFCanvasItem = (props: IIIFCanvasItemProps) => {

  const { canvas } = props;

  const { ref, inView } = useInView();
  
  const src = useMemo(() => props.canvas.getThumbnailURL(), [props.canvas]);

  const label = useMemo(() => getCanvasLabelWithFallback(props.canvas), [props.canvas]);

  return (
    <div ref={ref}>
      <div className="flex items-center justify-center w-[180px] h-[200px]">
        <div 
          data-selected={props.selected ? true : undefined}
          className="data-[selected]:outline outline-2 outline-offset-2 image-item cursor-pointer relative overflow-hidden rounded-md border w-[178px] h-[178px]">
          {inView ? (
            <img
              src={src}
              className="h-full w-full object-cover object-center transition-all aspect-square" 
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

            <div className="absolute bottom-0.5 right-2 text-white text-sm pointer-events-auto">
              <IIIFCanvasItemActions 
                canvas={canvas}
                canvasInfo={props.canvasInfo} 
                onSelect={props.onSelect}/>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm ml-1 max-w-[190px] overflow-hidden">
        <h3 
          className="overflow-hidden whitespace-nowrap text-ellipsis">
          {label}
        </h3>
        <p className="pt-1 text-xs text-muted-foreground">
          {canvas.width} x {canvas.height}
        </p>
      </div>
    </div>
  );

}