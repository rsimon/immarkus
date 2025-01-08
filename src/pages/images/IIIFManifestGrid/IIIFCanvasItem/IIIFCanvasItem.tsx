import { useMemo } from 'react';

import { Canvas } from '@iiif/presentation-3';
import { useInView } from 'react-intersection-observer';
import { getThumbnail } from '../../IIIFImporter/lib/helpers';
import { MessagesSquare } from 'lucide-react';


interface IIIFCanvasItemProps {

  canvas: Canvas;

  selected?: boolean;

}

export const IIIFCanvasItem = (props: IIIFCanvasItemProps) => {

  const { ref, inView } = useInView();
  
  const src = useMemo(() => getThumbnail(props.canvas), [props.canvas]);

  return (
    <div ref={ref}>
      <div 
        data-selected={props.selected ? true : undefined}
        className="data-[selected]:outline outline-2 outline-offset-2 image-item cursor-pointer relative overflow-hidden rounded-md border w-[178px] h-[178px]">
        {inView ? (
          <img
          src={src}
          className="h-auto w-auto object-cover transition-all aspect-square" />
        ) :(
          <div className="h-full w-full bg-muted" />
        )}

        <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full pointer-events-auto">
          <div className="text-white text-sm">
            <MessagesSquare 
              size={18} 
              className="inline align-text-bottom mr-1" /> 
              {/* annotations || */ 0}
          </div>

          <div className="absolute bottom-0.5 right-2 text-white text-sm pointer-events-auto">
            {/* <ImageItemActions 
              image={image} 
              onSelect={props.onSelect}/> */}
          </div>
        </div>
      </div>
      
    </div>
  );

}