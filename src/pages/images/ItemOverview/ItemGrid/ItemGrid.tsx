import { FolderItem } from './FolderItem';
import { IIIFManifestItem } from './IIIFManifestItem';
import { ImageItem } from './ImageItem';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';

export const ItemGrid = (props: ItemOverviewLayoutProps) => {

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
              annotationCount={(props.annotations.images[image.id] || []).length}
              selected={props.selected && 'id' in props.selected && props.selected?.id === image.id}
              onOpen={() => props.onOpenImage(image.id)} 
              onSelect={() => props.onSelectImage(image)}/>
          </li>
        ))}
      </ul>
    </div>    
  )

}