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
    <div className="h-full flex flex-col overflow-y-auto">
      <header className="h-48 basis-48 flex-shrink-0 overflow-hidden relative border-b">
        {loaded && (
          <img 
            onLoad={onLoad}
            className="object-cover" src={URL.createObjectURL(loaded.data)} />
        )}
      </header>

      <div className="text-sm flex flex-col flex-grow">
        <div className="p-3">
          <h2 className="whitespace-nowrap overflow-hidden text-ellipsis mb-0.5">{image.name}</h2>
          <div className="text-muted-foreground text-xs flex gap-1.5">
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
        </div>

        <div className="flex-grow flex flex-col">
          <Tabs defaultValue="annotations" className="flex-grow flex flex-col relative">
            <TabsList className="gap-2 -mx-0.5 px-3 py-0 bg-transparent rounded-none border-b flex justify-start shadow-sm relative">
              <TabsTrigger
                value="annotations" 
                className="text-xs h-full font-normal rounded-none border-b-2 border-transparent data-[state=active]:border-black pl-1 pr-1.5 py-1.5 shadow-none">
                <MessagesSquare className="h-3.5 w-3.5 mr-1.5" />Annotations
              </TabsTrigger>

              <TabsTrigger 
                value="information"
                className="text-xs h-full font-normal rounded-none border-b-2 border-transparent data-[state=active]:border-black pl-1 pr-1.5 py-1.5 shadow-none">
                <Info className="h-3.5 w-3.5 mr-1.5" />Information
              </TabsTrigger>
            </TabsList>

            <TabsContent value="annotations" className="mt-0">
              {annotations && (
                <AnnotationsTab annotations={annotations} />
              )}
            </TabsContent>

            <TabsContent value="information" className="mt-0 flex-grow flex flex-col relative">
              <MetadataTab image={image} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
  
}