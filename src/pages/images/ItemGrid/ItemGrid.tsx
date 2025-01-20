import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImages, useStore } from '@/store';
import { Folder, IIIFManifestResource, Image, LoadedFileImage, RootFolder } from '@/model';
import { FolderItem } from './FolderItem';
import { IIIFManifestItem } from './IIIFManifestItem';
import { ImageItem } from './ImageItem';
import { GridItem } from '../Types';

import './ItemGrid.css';

interface ItemGridProps {

  folder: Folder | RootFolder; 

  selected?: GridItem;

  onSelect(item: GridItem): void;

}

export const ItemGrid = (props: ItemGridProps) => {

  const store = useStore();
  
  const { folders, iiifResources, images } = useMemo(() => {
    return store.getFolderContents(props.folder.handle)
  }, [props.folder, store]);

  const loadedImages = useImages(images.map(i => i.id)) as LoadedFileImage[];

  const navigate = useNavigate();

  const onOpenFolder = (folder: Folder | IIIFManifestResource) =>
    navigate(`/images/${folder.id}`);

  const onOpenImage = (image: Image) =>
    navigate(`/annotate/${image.id}`);
  
  const onSelectFolder = (folder: Folder) =>
    props.onSelect({ type: 'folder', ...folder });

  const onSelectImage = (image: Image) =>
    props.onSelect({ type: 'image', ...image });

  return (
    <div className="item-grid">
      <ul>
        {folders.map(folder => (
          <li key={folder.id}>
            <FolderItem
              folder={folder} 
              onOpen={() => onOpenFolder(folder)} 
              onSelect={() => onSelectFolder(folder)}/>
          </li>
        ))}

        {iiifResources.map(resource => (
          <li key={resource.id}>
            {resource.type === 'PRESENTATION_MANIFEST' ? (
              <IIIFManifestItem
                resource={resource} 
                onOpen={() => onOpenFolder(resource)} />
            ) : null}
          </li>
        ))}

        {loadedImages.map(image => (
          <li key={image.id}>
            <ImageItem 
              image={image} 
              selected={props.selected && 'id' in props.selected && props.selected?.id === image.id}
              onOpen={() => onOpenImage(image)} 
              onSelect={() => onSelectImage(image)}/>
          </li>
        ))}
      </ul>
    </div>
  );
}