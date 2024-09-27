import { useEffect, useState } from 'react';
import { Info, MessagesSquare, MoveDiagonal, SquareArrowOutUpRight, X } from 'lucide-react';
import { W3CImageAnnotation } from '@annotorious/react';
import { Image, LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { useImageDimensions } from '@/utils/useImageDimensions';
import { Annotations } from './Annotations';
import { Information } from './Information';

interface SelectedImageProps {

  image: Image;

  onClose(): void;

}

export const SelectedImage = (props: SelectedImageProps) => {

  const { image } = props;

  const store = useStore();

  const loaded = useImages(image.id, 180) as LoadedImage;

  const { onLoad, dimensions } = useImageDimensions();

  const [annotations, setAnnotations] = useState<W3CImageAnnotation[]>([]);

  useEffect(() => {
    store.getAnnotations(image.id, { type: 'image' })
      .then(a => setAnnotations(a as W3CImageAnnotation[]));
  }, [store, image]);

  return (
    <div className="p-2">
      <Tabs defaultValue="annotations">
        <article className="bg-white shadow-sm rounded border overflow-hidden">
          <header>
            <div className="relative h-48 basis-48 flex-shrink-0 overflow-hidden border-b">
              {loaded ? (
                <img 
                  onLoad={onLoad}
                  className="object-cover object-center h-full w-full" src={URL.createObjectURL(loaded.data)} />
              ) : (
                <Skeleton className="" />
              )}

              <div className="absolute top-2 right-2 bg-white/70 rounded">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={props.onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex py-2 px-3 pr-2.5 text-sm items-start justify-between">
            <div className="overflow-hidden py-1 leading-relaxed">
              <h2 className="whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                {image.name}
              </h2>
              
              {dimensions && (
                <div 
                  className="flex items-center text-muted-foreground gap-1 text-xs">
                  <MoveDiagonal className="h-3.5 w-3.5" />
                  <span>{dimensions[0].toLocaleString()} x {dimensions[1].toLocaleString()}</span>
                </div>
              )}
            </div>

            <Button
              asChild
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full">
              <a href={`#/annotate/${image.id}`}>
                <SquareArrowOutUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        
          <div className="px-1.5 pb-2.5">
            <TabsList className="gap-2 bg-transparent">
              <TabsTrigger 
                value="annotations" 
                className="px-2.5 py-1.5 pr-3 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white">
                <MessagesSquare size={16} className="mr-2" /> {annotations.length} Annotations
              </TabsTrigger>

              <TabsTrigger 
                value="metadata" 
                className="px-2.5 py-1.5 pr-3 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white">
                <Info size={16} className="mr-2" /> Metadata
              </TabsTrigger>
            </TabsList>
          </div>
        </article>

        <TabsContent value="annotations">
          {loaded && (
            <Annotations 
              annotations={annotations} 
              image={loaded} />
          )}
        </TabsContent>

        <TabsContent value="metadata">
          <Information />
        </TabsContent>
      </Tabs>
    </div>
  )

}