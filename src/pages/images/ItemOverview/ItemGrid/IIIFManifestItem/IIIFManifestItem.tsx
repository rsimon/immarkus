import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { IIIFManifestResource, IIIFResource } from '@/model';
import { useStore } from '@/store';
import { isSingleImageManifest } from '@/utils/iiif';
import { IIIFManifestItemActions } from './IIIFManifestItemActions';
import { SingleCanvasManifestItem } from './SingleCanvasManifestItem';
import { OverviewItem } from '../../../Types';

import './IIIFManifestItem.css';

interface IIIFManifestItemProps {

  resource: IIIFResource;

  onOpen(): void;

  onSelect(item: OverviewItem): void;

}

export const IIIFManifestItem = (props: IIIFManifestItemProps) => {

  const resource = props.resource as IIIFManifestResource;

  const store = useStore();

  const onDeleteManifest = () => store.removeIIIFResource(resource);

  return isSingleImageManifest(props.resource) ? (
    <SingleCanvasManifestItem
      resource={props.resource as IIIFManifestResource}
      onDelete={onDeleteManifest}
      onSelect={props.onSelect} />
  ) : (
    <div>
      <div
        className="folder-item manifest-item cursor-pointer relative rounded-md 
          w-[200px] h-[200px] flex justify-center items-center">
        <button 
          onClick={props.onOpen}>
          <FolderIcon 
            className="scale w-[190px] h-[190px] transition-all drop-shadow-md" />

          <IIIFIcon
            className="iiif-logo text-white transition-all absolute bottom-5 left-4 size-6" />
        </button>
        
        <div className="absolute bottom-3.5 right-2 text-white text-sm pointer-events-auto">
          <IIIFManifestItemActions 
            resource={resource} 
            onDelete={onDeleteManifest} 
            onSelect={() => props.onSelect(resource)} />
        </div>
      </div>

      <div className="ml-2">
        <div>
          <h3
            className="text-sm max-w-[200px] overflow-hidden text-ellipsis">
            {resource.name}
          </h3>
          <p className="pt-1 text-xs text-muted-foreground">
            {`${resource.canvases.length.toLocaleString()} Canvas${resource.canvases.length === 1 ? '' : 'es'}`}
          </p>
        </div>
      </div>
    </div>
  )

}