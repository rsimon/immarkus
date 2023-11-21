import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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

  const onOpenImage = (image: Image) => {
    navigate(`/annotate/${image.id}`);
  }

  return (
    <div className="image-grid">
      <div className="space-y-1 headline">
        <h1 className="text-sm text-muted-foreground tracking-tight">
          {folderId ? (
            <nav className="breadcrumbs" aria-label="Breadcrumbs">
              <ol className="flex items-center gap-1">
                <li>
                  <Link className="hover:underline" to={`/images`}>{store.getRootFolder().name}</Link>
                </li>

                {currentFolder.path.length > 0 && (
                  <ChevronRight className="h-4 w-4" />
                )}

                {currentFolder.path.map((id, idx) => (
                  <>
                  <li key={`${idx}-${id}`}> 
                    <Link className="hover:underline" to={`/images/${id}`}>{store.getFolder(id).name}</Link>
                  </li>

                    {(idx < currentFolder.path.length - 1) && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </>
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