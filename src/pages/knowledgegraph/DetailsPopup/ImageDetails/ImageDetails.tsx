import { useEffect, useState } from 'react';
import { Image, LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { W3CAnnotation } from '@annotorious/react';
import { useImageDimensions } from '@/utils/useImageDimensions';
import { Button } from '@/ui/Button';
import { useNavigate } from 'react-router-dom';

interface ImageDetailsProps {

  image: Image;

}

export const ImageDetails = (props: ImageDetailsProps) => {

  const { image } = props;

  const store = useStore();

  const loaded = useImages(props.image.id, 100) as LoadedImage;

  const { onLoad, dimensions } = useImageDimensions();

  const [annotations, setAnnotations] = useState<W3CAnnotation[] | undefined>();

  const navigate = useNavigate();

  useEffect(() => {
    store.getAnnotations(image.id, { type: 'image' }).then(setAnnotations);
  }, [store, image]);

  return (
    <aside>
      <header className="h-32 overflow-hidden relative">
        {loaded && (
          <img 
            onLoad={onLoad}
            className="w-full h-full rounded-tl rounded-tr object-cover" src={URL.createObjectURL(loaded.data)} />
        )}
      </header>

      <div className="px-3 py-4 text-sm">
        <h2 className="whitespace-nowrap overflow-hidden text- text-ellipsis mb-0.5">{image.name}</h2>
        <div className="text-muted-foreground text-xs flex gap-1.5 mb-8">
          <div className="mb-0.5 flex gap-1 items-center">
            {annotations ? annotations.length : 0} Annotations
          </div>  
          <div>·</div>
          <div className="mb-0.5 flex gap-1 items-center">
            {dimensions && (
              <>{dimensions[0]} x {dimensions[1]}</>
            )}
          </div>
        </div>

        <Button 
          className="w-full"
          onClick={() => navigate(`/annotate/${image.id}`)}>
          Open Image
        </Button>
      </div>
    </aside>
  )
  
}