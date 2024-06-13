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
import { AppWindow, Info, MessagesSquare } from 'lucide-react';
import { useImageSearch } from '../../useImageSearch';

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

  const { getAggregatedMetadata } = useImageSearch();

  useEffect(() => {
    store.getAnnotations(image.id, { type: 'image' }).then(setAnnotations);

    getAggregatedMetadata(image.id).then(result => {
      console.log(result);
    });    
  }, [store, image]);

  const onOpen = () => navigate(`/annotate/${props.image.id}`, );
  
  const onOpenNewTab = () => window.open(`#/annotate/${props.image.id}`, '_blank');

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <header className="h-48 basis-48 flex-shrink-0 overflow-hidden relative border-b">
        {loaded && (
          <img 
            onLoad={onLoad}
            className="object-cover object-center h-full w-full" src={URL.createObjectURL(loaded.data)} />
        )}

        <div className="absolute bottom-3 right-2 flex items-center">
          <Button 
            className="pl-3 pr-2 py-1.5 h-8 rounded-full rounded-r-none"
            onClick={onOpen}>
            Open Image
          </Button>

          <Button 
            size="icon"
            className="pl-1 pr-2 py-1.5 h-8 rounded-full  rounded-l-none border-l border-white/20"
            onClick={onOpenNewTab}>
            <AppWindow className="h-4 w-4" />
          </Button>
        </div>
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
            <TabsList className="gap-2 px-3 py-0 bg-transparent rounded-none border-b flex justify-start shadow-sm relative">
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