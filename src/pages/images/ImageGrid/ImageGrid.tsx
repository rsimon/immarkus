import { MessagesSquare } from 'lucide-react';
import { useCollection } from '@/store';
import { ImageActions } from './ImageActions';

import './ImageGrid.css';

export const ImageGrid = () => {

  const collection = useCollection()!;

  return (
    <div className="image-grid">
      <div className="space-y-1 headline">
        <h1 className="text-2xl font-semibold tracking-tight">{collection.name}</h1>
        <p className="text-sm text-muted-foreground">
          {collection.images.length} images
        </p>
      </div>

      <ul>
        {collection.images.map(image => (
          <li key={image.name}>
            <div className="relative overflow-hidden rounded-md shadow border">
              <img
                loading="lazy"
                src={URL.createObjectURL(image.data)}
                alt={image.path}
                className="h-auto w-auto object-cover transition-all hover:scale-105 aspect-square"
              />

              <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full">
                <div className="text-white text-sm">
                  <MessagesSquare size={18} className="inline align-text-bottom mr-0.5" /> 0
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