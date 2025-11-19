import { FormEvent, useEffect, useMemo, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { CanvasInformation, Image } from '@/model';
import { useImageMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { IIIFIcon } from '@/components/IIIFIcon';
import { IIIFMetadataList } from '@/components/IIIFMetadataList';
import { ImageMetadataForm, hasChanges } from '@/components/MetadataForm';
import { PropertyValidation } from '@/components/PropertyFields';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/Tabs';
import { getCanvasAnnotations } from '@/utils/iiif';
import { useCanvas, useIIIFResource } from '@/utils/iiif/hooks';

interface ImageMetadataSectionProps {

  image: Image | CanvasInformation;

}

const IIIFManifestMetadataTab = (props: ImageMetadataSectionProps) => {

  const { manifestId } = props.image as CanvasInformation;

  const manifest = useIIIFResource(manifestId);

  const metadata = useMemo(() => {
    if (!manifest) return;
    return manifest.getMetadata();
  }, [manifest]);

  return metadata ? (
    <IIIFMetadataList 
      metadata={metadata} 
      emptyMessage="No Manifest Metadata" />
  ) : null;

}

const IIIFCanvasMetadataTab = (props: ImageMetadataSectionProps) => {

  const { manifestId, id: canvasId } = props.image as CanvasInformation;

  const id = `iiif:${manifestId}:${canvasId}`;

  const canvas = useCanvas(id);

  const metadata = useMemo(() => {
    if (!canvas) return;
    return canvas.getMetadata();
  }, [canvas]);

  const annotations = useMemo(() => {
    if (!canvas) return [];
    return getCanvasAnnotations(canvas.annotations);
  }, [canvas]);

  return metadata && (
    <IIIFMetadataList 
      annotations={annotations}
      metadata={metadata} 
      emptyMessage="No Canvas Metadata" />
  );
}

const MyImageMetadataTab = (props: ImageMetadataSectionProps) => {

  const { image } = props;

  const id =  image 
    ? 'uri' in image ? `iiif:${image.manifestId}:${image.id}` : image.id
    : undefined;

  const { metadata, updateMetadata } = useImageMetadata(id);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    updateMetadata(formState);
  }

  return (
    <PropertyValidation>
      <form 
        className="flex flex-col grow justify-between w-full"
        onSubmit={onSubmit}>
        <div>
          <ImageMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

        <Button 
          disabled={!hasChanges(metadata, formState)} 
          className="w-full mb-2">
          Save Metadata
        </Button>
      </form>
    </PropertyValidation>
  )

}

export const ImageMetadataSection = (props: ImageMetadataSectionProps) => {

  const { image } = props;

  return 'uri' in image ? (
    <Tabs 
      defaultValue="iiif-manifest" 
      className="w-full grow flex flex-col">
      <TabsList className="grid grid-cols-3 w-auto p-1 h-auto">
        <TabsTrigger 
          value="iiif-manifest"
          className="text-xs py-1 flex gap-1 items-center">
          <IIIFIcon light className="size-3.5 mb-0.5" /> Manifest
        </TabsTrigger>

        <TabsTrigger 
          value="iiif-canvas"
          className="text-xs py-1 flex gap-1 items-center">
          <IIIFIcon light className="size-3.5 mb-0.5" /> Canvas
        </TabsTrigger>

        <TabsTrigger 
          value="my"
          className="text-xs py-1 px-2 flex gap-1">
          <NotebookPen className="size-3.5" /> My
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="iiif-manifest"
        className="grow">
        <IIIFManifestMetadataTab {...props} />
      </TabsContent>

      <TabsContent value="iiif-canvas"
        className="grow">
        <IIIFCanvasMetadataTab {...props} />
      </TabsContent>

      <TabsContent 
        value="my"
        className="data-[state=active]:grow data-[state=active]:flex">
        <MyImageMetadataTab {...props} />
      </TabsContent>
    </Tabs>
  ) : (
    <MyImageMetadataTab {...props} />
  )

}