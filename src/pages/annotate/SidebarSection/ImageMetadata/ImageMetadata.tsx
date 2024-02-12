import { useStore } from '@/store';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { ImageMetadataSection } from './ImageMetadataSection';

export const ImageMetadata = () => {

  const anno = useAnnotoriousManifold();

  const store = useStore();

  const images = anno.sources.map(source => store.getImage(source));

  return images.length === 1 ? (
    <div className="flex-grow flex flex-col text-sm justify-center items-center w-full p-3 px-4">
      <ImageMetadataSection image={images[0]} />
    </div>
  ) : (
    <div className="px-4 py-2 text-sm">
      <ul>
        {images.map(image => (
          <li key={image.id} className="border-b mb-4 pb-6">
            <h2 className="text-xs font-medium mb-6 overflow-hidden text-ellipsis">
              {image.name}
            </h2>

            <ImageMetadataSection image={image} />
          </li>
        ))}
      </ul>
    </div>
  )

}