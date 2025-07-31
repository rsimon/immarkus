import { memo, useEffect, useMemo, useState } from 'react';
import { MessagesSquare, MoveDiagonal, NotebookPen, Spline, SquareArrowOutUpRight, X } from 'lucide-react';
import { W3CImageAnnotation } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import { LoadedFileImage, LoadedIIIFImage, LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { useImageDimensions } from '@/utils/useImageDimensions';
import { Annotations } from './Annotations';
import { Metadata } from './Metadata';
import { ImageRelationships } from './ImageRelationships';
import { GraphNode } from '../../Types';
import { FilePreviewImage, IIIFPreviewImage } from './PreviewImage';

interface SelectedImageProps {

  image: GraphNode;

  onClose(): void;

}

const SelectedImageComponent = (props: SelectedImageProps) => {

  const { image } = props;

  const store = useStore();

  const loaded = useImages(image.id) as LoadedImage;

  const { onLoad, dimensions: fileImageDimensions } = useImageDimensions();

  const dimensions = useMemo(() => {
    if (!loaded) return;

    if (fileImageDimensions) return fileImageDimensions;

    if (loaded.id.startsWith('iiif:')) {
      const { canvas }= (loaded as LoadedIIIFImage);
      return [canvas.width!, canvas.height!];
    }
  }, [loaded, fileImageDimensions])

  const [annotations, setAnnotations] = useState<W3CImageAnnotation[]>([]);

  const [relationships, setRelationships] = useState<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][]>([]);

  const [tab, setTab] = useState<string>('annotations'); 

  useEffect(() => {
    if (annotations.length === 0) return;
    store.getRelations(image.id).then(setRelationships);
  }, [annotations, image, store]);

  useEffect(() => {
    store.getAnnotations(image.id, { type: 'image' })
      .then(a => setAnnotations(a as W3CImageAnnotation[]));
  }, [store, image]);

  return (
    <div className="p-2">
      <Tabs 
        value={tab}
        onValueChange={setTab}>
        <article className="bg-white shadow-xs rounded border overflow-hidden">
          <header>
            <div className="relative h-48 basis-48 shrink-0 overflow-hidden border-b">
              {loaded && (
                loaded.id.startsWith('iiif:') ? (
                  <IIIFPreviewImage 
                    image={loaded as LoadedIIIFImage} />
                ) : (
                  <FilePreviewImage 
                    image={loaded as LoadedFileImage} 
                    onLoad={onLoad} />
                )
              )}

              <div className="absolute top-2 right-2 bg-white/70 rounded-full">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={props.onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex py-2 px-3 pr-2 text-sm items-start justify-between">
            <div className="overflow-hidden py-1 leading-relaxed">
              <h2 className="whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                {image.label}
              </h2>
              
              {dimensions && (
                <div 
                  className="flex items-center text-muted-foreground gap-1 text-xs">
                  <MoveDiagonal className="h-3.5 w-3.5" />
                  <span>{dimensions[0].toLocaleString()} x {dimensions[1].toLocaleString()} px</span>
                </div>
              )}
            </div>

            <Button
              asChild
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded">
              <a href={`#/annotate/${image.id}`}>
                <SquareArrowOutUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        
          <div className="px-1.5 pb-2.5">
            <TabsList className="gap-1.5 bg-transparent">
              <TabsTrigger 
                value="annotations" 
                className="transition-none px-2.5 py-1.5 pr-3 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white">
                <MessagesSquare size={15} className="mr-1.5" /> 
                {annotations.length} 
                {tab === 'annotations' && (
                  <span className="ml-1">Annotations</span>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="relationships" 
                className="transition-none px-2.5 py-1.5 pr-3 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white">
                <Spline size={15} className="mr-1.5" /> 
                {relationships.length} 
                {tab === 'relationships' && (
                  <span className="ml-1">Relationships</span>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="metadata" 
                className={`transition-none pl-2 ${tab === 'metadata' ? 'pr-3' : 'pr-2'} py-1.5 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white`}>
                <NotebookPen size={15} className="mx-1" />
                {tab === 'metadata' && (
                  <span className="ml-1">Metadata</span>
                )}
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

        <TabsContent value="relationships">
          {loaded && (
            <ImageRelationships 
              annotations={annotations}
              selectedImage={loaded} 
              relationships={relationships}  />
          )}
        </TabsContent>

        <TabsContent value="metadata">
          <Metadata 
            imageId={image.id} />
        </TabsContent>
      </Tabs>
    </div>
  )

}

// Memo-ize the component to avoid unncessary re-renders. (Large preview images slow things down!)
export const SelectedImage = memo(SelectedImageComponent, (prevProps, nextProps) => (
  prevProps.image.id === nextProps.image.id &&
  prevProps.onClose === nextProps.onClose
));