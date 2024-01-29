import { useNavigate } from 'react-router-dom';
import { useImages } from '@/store';
import { Folder, Image, LoadedImage } from '@/model';
import { FolderItem } from './FolderItem';
import { ImageItem } from './ImageItem';
import { GridItem } from './Item';

import './ItemGrid.css';

interface ItemGridProps {

  folders: Folder[];

  images: Image[];

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
    <div className="image-grid">
      <ul>
        {props.folders.map(folder => (
          <li key={folder.id}>
            <FolderItem
              folder={folder} 
              onOpen={() => onOpenFolder(folder)} />
          </li>
        ))}

        {images.map(image => (
          <li key={image.id}>
            <ImageItem 
              image={image} 
              onOpen={() => onOpenImage(image)} 
              onSelect={() => onSelectImage(image)}/>
          </li>
        ))}
      </ul>

      <svg xmlns="http://www.w3.org/2000/svg" className="w-0 h-0">
        <defs>
          <linearGradient id="folder-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c2c8d0" />
            <stop offset="100%" stopColor="#a8afbb" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}