import { Sorting } from '@/utils/useImageSorting';
import { FolderItem } from './FolderItem';
import { IIIFManifestItem } from './IIIFManifestItem';
import { ImageItem } from './ImageItem';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';
import { useMemo } from 'react';
import { isSingleImageManifest } from '@/utils/iiif';
import { IIIFManifestResource } from '@/model';

interface ItemGridProps extends ItemOverviewLayoutProps {

  sorting?: Sorting;

}

const sortItems = <T extends { id: string; name: string }>(
  items: T[],
  sorting: Sorting | undefined,
  getAnnotationCount: (item: T) => number
): T[] => {
  if (!sorting?.sortField || !sorting?.sortOrder) {
    return items;
  }

  return [...items].sort((a, b) => {
    if (sorting.sortField === 'name') {
      return sorting.sortOrder * a.name.localeCompare(b.name);
    } else if (sorting.sortField === 'annotations') {
      const annotationsA = getAnnotationCount(a);
      const annotationsB = getAnnotationCount(b);
      return (annotationsA - annotationsB) * sorting.sortOrder;
    }
    return 0;
  });
}

export const ItemGrid = (props: ItemGridProps) => {

  const { folderLikeManifests, singleImageManifests } = useMemo(() => {
    const folderLikeManifests = 
      props.iiifResources.filter(resource => !isSingleImageManifest(resource)) as IIIFManifestResource[];

    const singleImageManifests = 
      props.iiifResources.filter(isSingleImageManifest) as IIIFManifestResource[];

    return { folderLikeManifests, singleImageManifests }
  }, [props.iiifResources]);

  const sortedFolders = useMemo(() => {
    const unsorted = [
      ...props.folders,
      ...folderLikeManifests
    ];

    return sortItems(unsorted, props.sorting, item => 
      (props.annotations.folders[item.id] || []).length);
  }, [props.folders, props.sorting, props.annotations.folders, folderLikeManifests]);

  const sortedImages = useMemo(() => {
    const unsorted = [
      ...props.images,
      ...singleImageManifests
    ];

    return sortItems(unsorted, props.sorting, item => 
      (props.annotations.images[item.id] || []).length);
  }, [props.images, singleImageManifests, props.sorting, props.annotations.images]);

  return (
    <div className="item-grid">
      <ul>
        {sortedFolders.map(item => (
          <li key={item.id}>
            {'handle' in item ? (
              <FolderItem
                annotationCount={(props.annotations.folders[item.id] || []).length}
                folder={item}
                onOpen={() => props.onOpenFolder(item)}
                onSelect={() => props.onSelectFolder(item)} />
            ) : (
              <IIIFManifestItem
                annotationCount={(props.annotations.folders[item.id] || []).length}
                resource={item as IIIFManifestResource}
                onOpen={() => props.onOpenFolder(item)}
                onSelect={props.onSelectItem} />
            )}
          </li>
        ))}

        {sortedImages.map(image => (
          <li key={image.id}>
            {'canvases' in image ? ( 
              <IIIFManifestItem
                annotationCount={(props.annotations.folders[image.id] || []).length}
                resource={image as IIIFManifestResource}
                onOpen={() => props.onOpenFolder(image)}
                onSelect={props.onSelectItem} />
            ) : (
              <ImageItem
                image={image}
                annotationCount={(props.annotations.images[image.id] || []).length}
                selected={props.selected && 'id' in props.selected && props.selected?.id === image.id}
                onOpen={() => props.onOpenImage(image.id)} 
                onAddToWorkspace={() => props.onAddToWorkspace(image.id)}
                onSelect={() => props.onSelectImage(image)}/>
            )}
          </li>
        ))}
      </ul>
    </div>    
  )

}