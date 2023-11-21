import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useImages, useStore } from '@/store';
import { Image, LoadedImage } from '@/model';
import { FolderItem } from './FolderItem';
import { ImageItem } from './ImageItem';

import './ImageGrid.css';

export const ImageGrid = () => {

  const store = useStore()!;

  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle>(store.rootDir);

  const items = useMemo(() => store.getDirContents(folderHandle), [folderHandle]);

  const { folders } = items;

  const images = useImages(items.images.map(i => i.id)) as LoadedImage[];

  const navigate = useNavigate();

  const onOpen = (image: Image) =>
    navigate(`/annotate/${image.id}`);

  return (
    <div className="image-grid">
      <div className="space-y-1 headline">
        <h1 className="text-sm text-muted-foreground tracking-tight">Folder</h1>
        <h2 className="text-3xl font-semibold tracking-tight">
          {/* TODO */}
          {store.rootDir.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {images.length} images
        </p>
      </div>

      <ul>
        {folders.map(folder => (
          <li key={folder.name}>
            <FolderItem folder={folder} />
          </li>
        ))}

        {images.map(image => (
          <li key={image.name}>
            <ImageItem 
              image={image} 
              onOpen={() => onOpen(image)} />
          </li>
        ))}
      </ul>
    </div>
  );
}