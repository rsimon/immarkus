import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Braces, NotebookPen } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { IIIFMetadataList } from '@/components/IIIFMetadataList';
import { hasChanges, ImageMetadataForm } from '@/components/MetadataForm';
import { PropertyValidation } from '@/components/PropertyFields';
import { useImageMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/Tabs';
import { useCanvas } from '@/utils/iiif/hooks';

interface MetadataProps {

  imageId: string;

}

const MyMetadata = (props: MetadataProps) => {

  const { metadata, updateMetadata } = useImageMetadata(props.imageId);

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
        className="py-2"
        onSubmit={onSubmit}>
        <ImageMetadataForm
          metadata={formState}
          onChange={setFormState} />

        <div className="pt-2">        
          <Button 
            disabled={!hasChanges(metadata, formState)} 
            className="w-full mb-2"
            type="submit">
            Save
          </Button>
        </div>
      </form>
    </PropertyValidation>
  )

}

const IIIFMetadata = (props: MetadataProps) => {

  const canvas = useCanvas(props.imageId);

  const metadata = useMemo(() => {
    if (!canvas) return;
    return canvas.getMetadata();
  }, [canvas]);

  return metadata ? (
    <IIIFMetadataList metadata={metadata} />
  ) : null;

}

export const Metadata = (props: MetadataProps) => {

  return  props.imageId.startsWith('iiif:') ? (
    <div className="bg-white shadow-xs rounded border px-4 py-3">
      <Tabs 
        defaultValue="my">
        <TabsList className="grid grid-cols-2 w-auto p-1 h-auto">
          <TabsTrigger 
            value="my"
            className="text-xs py-1 px-2 flex gap-1.5">
            <NotebookPen className="size-3.5" /> My
          </TabsTrigger>

          <TabsTrigger 
            value="iiif"
            className="text-xs py-1 flex gap-1.5">
            <Braces className="size-3.5" /> IIIF
          </TabsTrigger>
        </TabsList>

        <TabsContent 
          value="my">
          <MyMetadata {...props} />
        </TabsContent>

        <TabsContent value="iiif"
          className="grow">
          <IIIFMetadata {...props} />
        </TabsContent>
      </Tabs>
    </div>
  ) : (
    <div className="bg-white shadow-xs rounded border px-4">
      <MyMetadata {...props} />
    </div>
  )
}