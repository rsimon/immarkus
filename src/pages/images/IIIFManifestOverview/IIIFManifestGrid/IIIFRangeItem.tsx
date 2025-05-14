import { MessagesSquare } from 'lucide-react';
import { CozyRange } from 'cozy-iiif';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';

interface IIIFRangeItemProps {

  annotationCount: number;

  range: CozyRange;

  onOpen(): void;

}

export const IIIFRangeItem = (props: IIIFRangeItemProps) => {

  return (
    <div>
      <div 
        className="folder-item cursor-pointer relative rounded-md 
          w-[200px] h-[200px] flex justify-center items-center">

        <button 
          onClick={props.onOpen}>
          <FolderIcon 
            className="scale w-[190px] h-[190px] transition-all drop-shadow-md" />

          <IIIFIcon
            light
            className="iiif-logo text-white transition-all absolute top-5 left-4 size-5" />
        </button>

        <div className="absolute bottom-2.5 px-3 pt-10 pb-3 left-1.5 w-full pointer-events-auto text-white text-sm">
          <MessagesSquare 
            size={18} 
            className="inline align-text-bottom mr-1" /> 
          {props.annotationCount.toLocaleString()}
        </div>
      </div>

      <div className="ml-2">
        <h3
          className="text-sm max-w-[200px] overflow-hidden text-ellipsis">
          {props.range.getLabel()}
        </h3>
      </div>
    </div>
  );

}