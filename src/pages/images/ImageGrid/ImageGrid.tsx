import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useImages, useStore } from '@/store';
import { Folder, Image, LoadedImage } from '@/model';
import { FolderItem } from './FolderItem';
import { ImageItem } from './ImageItem';

import './ImageGrid.css';

interface ImageGridProps {

  folderId?: string;

}

export const ImageGrid = (props: ImageGridProps) => {

  const { folderId } = props;

  const store = useStore()!;

  const navigate = useNavigate();

  const currentFolder = useMemo(() => folderId ? store.getFolder(folderId) : store.getRootFolder(), [folderId]);

  if (!currentFolder)
    navigate('/404');

  const items = useMemo(() => store.getFolderContents(currentFolder.handle), [currentFolder]);

  const { folders } = items;

  const images = useImages(items.images.map(i => i.id)) as LoadedImage[];

  const onOpenFolder = (folder: Folder) =>
    navigate(`/images/${folder.id}`);

  const onOpenImage = (image: Image) =>
    navigate(`/annotate/${image.id}`);

  return (
    <div className="image-grid">
      <div className="space-y-1 headline">
        <h1 className="text-sm text-muted-foreground tracking-tight">
          {folderId ? (
            <nav aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link to={`/images`}>{store.getRootFolder().name}</Link>
                </li>

                {currentFolder.path.map((id, idx) => (
                  <li key={`${idx}-${id}`}> 
                    <Link to={`/images/${id}`}>{store.getFolder(id).name}</Link>
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <span>Folder</span>
          )}
        </h1>
        <h2 className="text-3xl font-semibold tracking-tight">
          {currentFolder.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {images.length} images
        </p>
      </div>

      <ul>
        {folders.map(folder => (
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
              onOpen={() => onOpenImage(image)} />
          </li>
        ))}
      </ul>
    </div>
  );
}