import { CozyRange } from 'cozy-iiif';
import { FolderIcon } from '@/components/FolderIcon';

interface IIIFRangeItemProps {

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
        </button>
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