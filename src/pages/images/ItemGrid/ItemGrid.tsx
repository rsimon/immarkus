import { useNavigate } from 'react-router-dom';
import { useImages } from '@/store';
import { Folder, Image, LoadedImage } from '@/model';
import { FolderItem } from './FolderItem';
import { ImageItem } from './ImageItem';
import { GridItem } from '../Types';

import './ItemGrid.css';

interface ItemGridProps {

  folders: Folder[];

  images: Image[];

  selected?: GridItem;

  onSelect(item: GridItem): void;

}

export const ItemGrid = (props: ItemGridProps) => {

  const images = useImages(props.images.map(i => i.id)) as LoadedImage[];

  const navigate = useNavigate();

  const onOpenFolder = (folder: Folder) =>
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
        {props.folders.map(folder => (
          <li key={folder.id}>
            <FolderItem
              folder={folder} 
              onOpen={() => onOpenFolder(folder)} 
              onSelect={() => onSelectFolder(folder)}/>
          </li>
        ))}

        {images.map(image => (
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