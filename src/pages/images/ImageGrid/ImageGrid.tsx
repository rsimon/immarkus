import { MessagesSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Image } from '@/model';
import { ImageActions } from './ImageActions';

import './ImageGrid.css';

export const ImageGrid = () => {

  const store = useStore()!;

  const navigate = useNavigate();

  const onOpen = (image: Image) => () =>
    navigate(`/annotate/${image.id}`);

  return (
    <div className="image-grid">
      <div className="space-y-1 headline">
        <h1 className="text-sm text-muted-foreground tracking-tight">Folder</h1>
        <h2 className="text-3xl font-semibold tracking-tight">{store.handle.name}</h2>
        <p className="text-sm text-muted-foreground">
          {store.images.length} images
        </p>
      </div>

      <ul>
        {store.images.map(image => (
          <li key={image.name}>
            <div 
              className="cursor-pointer relative overflow-hidden rounded-md border"
              onClick={onOpen(image)}>
              <img
                loading="lazy"
                src={URL.createObjectURL(image.data)}
                alt={image.path}
                className="h-auto w-auto object-cover transition-all aspect-square"
              />

              <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full">
                <div className="text-white text-sm">
                  <MessagesSquare 
                    size={18} 
                    className="inline align-text-bottom mr-0.5" /> {store.countAnnotations(image.id)}
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