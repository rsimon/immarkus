import { MessagesSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useImages, useStore } from '@/store';
import { Image, LoadedImage } from '@/model';
import { ImageActions } from './ImageActions';

import './ImageGrid.css';

export const ImageGrid = () => {

  const store = useStore()!;

  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle>(store.rootDir);

  const items = useMemo(() => store.getDirContents(folderHandle), [folderHandle]);

  const { folders } = items;

  const images = useImages(items.images.map(i => i.id)) as LoadedImage[];

  const navigate = useNavigate();

  const onOpen = (image: Image) => () =>
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
        {images.map(image => (
          <li key={image.name}>
            <div 
              className="cursor-pointer relative overflow-hidden rounded-md border w-[200px] h-[200px]"
              onClick={onOpen(image)}>
              <img
                loading="lazy"
                src={URL.createObjectURL(image.data)}
                alt={image.name}
                className="h-auto w-auto object-cover transition-all aspect-square"
              />

              <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full">
                <div className="text-white text-sm">
                  <MessagesSquare 
                    size={18} 
                    className="inline align-text-bottom mr-0.5" /> 0 {/* store.countAnnotations(image.id) */}
                </div>

                <div className="absolute bottom-0 right-2 text-white text-sm">
                  <ImageActions image={image} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}