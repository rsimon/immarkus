import { useEffect, useState } from 'react';
import { Thumbnail } from '@/components/Thumbnail';
import { Image } from '@/model';
import { useStore } from '@/store';
import { W3CAnnotation } from '@annotorious/react';

interface ImageDetailsProps {

  image: Image;

}

export const ImageDetails = (props: ImageDetailsProps) => {

  const { image } = props;

  const store = useStore();

  const [annotations, setAnnotations] = useState<W3CAnnotation[] | undefined>();

  useEffect(() => {
    store.getAnnotations(image.id).then(setAnnotations);
  }, [store, image]);

  return (
    <aside>
      <h2>{image.name}</h2>
      <figure>
        <Thumbnail image={image} />
      </figure>
      <p>
        {annotations && (
          <span>{annotations.length} annotations</span>
        )}
      </p>
    </aside>
  )
  
}