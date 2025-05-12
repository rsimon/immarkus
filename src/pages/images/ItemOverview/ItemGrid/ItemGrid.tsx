import { Folder, IIIFResource, IIIFManifestResource, Image, LoadedFileImage } from '@/model';
import { FolderItem } from './FolderItem';
import { IIIFManifestItem } from './IIIFManifestItem';
import { ImageItem } from './ImageItem';
import { GridItem } from '../../Types';

import './ItemGrid.css';

interface ItemGridProps {

  annotationCounts: Record<string, number>;

  folders: Folder[];

  iiifResources: IIIFResource[];

  images: LoadedFileImage[];

  selected: GridItem

  onOpenFolder(folder: Folder | IIIFManifestResource): void;

  onOpenImage(image: Image): void;

  onSelectFolder(folder: Folder): void;

  onSelectImage(image: Image): void;

  onSelectManifest(manifest: IIIFManifestResource): void;

}

export const ItemGrid = (props: ItemGridProps) => {

  return (
    <div className="item-grid">
      <ul>
        {props.folders.map(folder => (
          <li key={folder.id}>
            <FolderItem
              folder={folder} 
              onOpen={() => props.onOpenFolder(folder)} 
              onSelect={() => props.onSelectFolder(folder)}/>
          </li>
        ))}

        {props.iiifResources.map(resource => (
          <li key={resource.id}>
            {resource.type === 'PRESENTATION_MANIFEST' ? (
              <IIIFManifestItem
                resource={resource} 
                onOpen={() => props.onOpenFolder(resource)} 
                onSelect={props.onSelectManifest}/>
            ) : null}
          </li>
        ))}

        {props.images.map(image => (
          <li key={image.id}>
            <ImageItem 
              image={image} 
              annotationCount={props.annotationCounts[image.id] || 0}
              selected={props.selected && 'id' in props.selected && props.selected?.id === image.id}
              onOpen={() => props.onOpenImage(image)} 
              onSelect={() => props.onSelectImage(image)}/>
          </li>
        ))}
      </ul>
    </div>    
  )

}