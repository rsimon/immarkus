import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Braces, NotebookPen } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { CanvasInformation, Image } from '@/model';
import { useImageMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { IIIFMetadataList } from '@/components/IIIFMetadataList';
import { ImageMetadataForm, hasChanges } from '@/components/MetadataForm';
import { PropertyValidation } from '@/components/PropertyFields';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/Tabs';
import { useCanvas } from '@/utils/iiif/hooks';

interface ImageMetadataSectionProps {

  image: Image | CanvasInformation;

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

const IIIFMetadataTab = (props: ImageMetadataSectionProps) => {

  const { manifestId, id: canvasId } = props.image as CanvasInformation;

  const id = `iiif:${manifestId}:${canvasId}`;

  const canvas = useCanvas(id);

  const metadata = useMemo(() => {
    if (!canvas) return;
    return canvas.getMetadata();
  }, [canvas]);

  return metadata ? (
    <IIIFMetadataList metadata={metadata} />
  ) : null;

}

export const ImageMetadataSection = (props: ImageMetadataSectionProps) => {

  const { image } = props;

  return 'uri' in image ? (
    <Tabs 
      defaultValue="iiif" 
      className="w-full grow flex flex-col">
      <TabsList className="grid grid-cols-2 w-auto p-1 h-auto">
        <TabsTrigger 
          value="iiif"
          className="text-xs py-1 flex gap-1.5">
          <Braces className="size-3.5" /> IIIF Metadata
        </TabsTrigger>

        <TabsTrigger 
          value="my"
          className="text-xs py-1 px-2 flex gap-1.5">
          <NotebookPen className="size-3.5" /> My Metadata
        </TabsTrigger>
      </TabsList>

      <TabsContent 
        value="my"
        className="data-[state=active]:grow data-[state=active]:flex">
        <MyImageMetadataTab {...props} />
      </TabsContent>

      <TabsContent value="iiif"
        className="grow">
        <IIIFMetadataTab {...props} />
      </TabsContent>
    </Tabs>
  ) : (
    <MyImageMetadataTab {...props} />
  )

}