import { FolderIcon } from '@/components/FolderIcon';
import { IIIFResource } from '@/model';
import { IIIFManifestItemActions } from './IIIFManifestItemActions';

interface IIIFManifestItemProps {

  resource: IIIFResource;

  onOpen(): void;

}

export const IIIFManifestItem = (props: IIIFManifestItemProps) => {

  return (
    <div>
      <div 
        className="folder-item cursor-pointer relative rounded-md 
          w-[200px] h-[200px] flex justify-center items-center">

        <button 
          onClick={props.onOpen}>
          <FolderIcon 
            className="w-[190px] h-[190px] transition-all drop-shadow-md" />
        </button>
        
        <div className="absolute bottom-3.5 right-2 text-white text-sm pointer-events-auto">
          <IIIFManifestItemActions 
            resource={props.resource} />
        </div>
      </div>

      <div className="ml-2">
        <div>
          <h3
            className="text-sm max-w-[200px] overflow-hidden text-ellipsis">
            {props.resource.name}
          </h3>
        </div>
      </div>
    </div>
  )
}