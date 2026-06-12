import { Sorting } from '@/utils/useImageSorting';
import { FolderItem } from './FolderItem';
import { IIIFManifestItem } from './IIIFManifestItem';
import { ImageItem } from './ImageItem';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';
import { useMemo } from 'react';

interface ItemGridProps extends ItemOverviewLayoutProps {

  sorting?: Sorting;

}

export const ItemGrid = (props: ItemGridProps) => {

  const sortedFolders = useMemo(() => {
    if (!props.sorting?.sortField || !props.sorting?.sortOrder) return props.folders;
 
    // TODO
    return props.folders;
  }, [props.folders, props.sorting]);

  return (
    <div className="item-grid">
      <ul>
        {props.folders.map(folder => (
          <li key={folder.id}>
            <FolderItem
              annotationCount={(props.annotations.folders[folder.id] || []).length}
              folder={folder} 
              onOpen={() => props.onOpenFolder(folder)} 
              onSelect={() => props.onSelectFolder(folder)}/>
          </li>
        ))}

        {props.iiifResources.map(resource => (
          <li key={resource.id}>
            {resource.type === 'PRESENTATION_MANIFEST' ? (
              <IIIFManifestItem
                annotationCount={(props.annotations.folders[`iiif:${resource.id}`] || []).length}
                resource={resource} 
                onOpen={() => props.onOpenFolder(resource)} 
                onSelect={props.onSelectItem}/>
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
              onAddToWorkspace={() => props.onAddToWorkspace(image.id)}
              onSelect={() => props.onSelectImage(image)}/>
          </li>
        ))}
      </ul>
    </div>    
  )

}