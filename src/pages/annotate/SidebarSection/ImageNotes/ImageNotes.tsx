import { useStore } from '@/store';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { ImageNotesItem } from './ImageNotesItem';

export const ImageNotes = () => {

  const anno = useAnnotoriousManifold();

  const store = useStore();

  const images = anno.sources.map(source => store.getImage(source));

  return images.length === 1 ? (
    <div className="py-2 grow">
      <ImageNotesItem image={images[0]} />
    </div>
  ) : (
    <div className="py-2 grow">
      <ul>
        {images.map(image => (
          <li key={image.id}>
            <h2 className="text-xs font-medium mb-2">
              {image.name}
            </h2>

            <ImageNotesItem image={image} />
          </li>
        ))}
      </ul>
    </div>
  )

}