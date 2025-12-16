import { MessagesSquare } from 'lucide-react';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { TruncatedLabel } from '@/components/TruncatedLabel';
import { IIIFManifestResource, IIIFResource } from '@/model';
import { useStore } from '@/store';
import { isSingleImageManifest } from '@/utils/iiif';
import { IIIFManifestItemActions } from './IIIFManifestItemActions';
import { SingleCanvasManifestItem } from './SingleCanvasManifestItem';
import { OverviewItem } from '../../../Types';

interface IIIFManifestItemProps {

  annotationCount: number;

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
      annotationCount={props.annotationCount}
      resource={props.resource as IIIFManifestResource}
      onDelete={onDeleteManifest}
      onSelect={props.onSelect} />
  ) : (
    <div>
      <div
        className="folder-item manifest-item cursor-pointer relative rounded-md 
          w-50 h-50 flex justify-center items-center">
        <button 
          onClick={props.onOpen}>
          <FolderIcon 
            className="scale w-47.5 h-47.5 transition-all drop-shadow-md" />

          <IIIFIcon
            className="iiif-logo text-white transition-all absolute top-5 left-4 size-5" />
        </button>
        
        <div className="absolute bottom-3 px-3 pt-10 pb-3 left-1.5 w-full pointer-events-auto">
          <div className="text-white text-sm">
            <MessagesSquare 
              size={18} 
              className="inline align-text-bottom mr-1" /> 
              {props.annotationCount.toLocaleString()}
          </div>

          <div className="absolute bottom-0.5 right-3 text-white text-sm pointer-events-auto">
            <IIIFManifestItemActions 
              resource={resource} 
              onDelete={onDeleteManifest} 
              onSelect={() => props.onSelect(resource)} />
          </div>
        </div>
      </div>

      <div className="ml-2">
        <div className="text-sm ml-1 max-w-47.5 overflow-hidden">
          <TruncatedLabel value={resource.name} />
          <p className="pt-1 text-xs text-muted-foreground">
            {`${resource.canvases.length.toLocaleString()} Canvas${resource.canvases.length === 1 ? '' : 'es'}`}
          </p>
        </div>
      </div>
    </div>
  )

}