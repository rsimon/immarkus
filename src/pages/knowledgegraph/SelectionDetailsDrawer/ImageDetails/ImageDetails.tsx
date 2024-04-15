import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { W3CAnnotation } from '@annotorious/react';
import { Image, LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { useImageDimensions } from '@/utils/useImageDimensions';
import { Button } from '@/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { AnnotationsTab } from './AnnotationsTab/AnnotationsTab';
import { MetadataTab } from './MetadataTab';
import { Info, MessagesSquare } from 'lucide-react';

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
    <div>
      <header className="h-48 overflow-hidden relative border-b">
        {loaded && (
          <img 
            onLoad={onLoad}
            className="w-full h-full object-cover" src={URL.createObjectURL(loaded.data)} />
        )}
      </header>

      <div className="p-3 text-sm">
        <h2 className="whitespace-nowrap overflow-hidden text- text-ellipsis mb-0.5">{image.name}</h2>
        <div className="text-muted-foreground text-xs flex gap-1.5 mb-4">
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

        <Tabs defaultValue="annotations">
          <TabsList className="gap-2 mb-4 -mx-0.5">
            <TabsTrigger
              value="annotations" 
              className="text-xs font-normal">
              <MessagesSquare className="h-3.5 w-3.5 mr-1.5" />Annotations
            </TabsTrigger>

            <TabsTrigger 
              value="information"
              className="text-xs font-normal">
              <Info className="h-3.5 w-3.5 mr-1.5" />Information
            </TabsTrigger>
          </TabsList>

          <TabsContent value="annotations">
            {annotations && (
              <AnnotationsTab annotations={annotations} />
            )}
          </TabsContent>

          <TabsContent value="information">
            <MetadataTab image={image} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
  
}