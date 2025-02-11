import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Braces, NotebookPen, PanelTop } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { W3CAnnotationBody } from '@annotorious/react';
import { PropertyValidation } from '@/components/PropertyFields';
import { FolderMetadataForm, hasChanges, ImageMetadataForm } from '@/components/MetadataForm';
import { IIIFMetadataList } from '@/components/IIIFMetadataList';
import { IIIFManifestResource } from '@/model';
import { useImageMetadata, useManifestMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { CozyMetadata } from '@/utils/cozy-iiif';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { CanvasGridItem } from '../Types';

interface MetadataListProps {

  folder?: boolean;

  customMetadata: W3CAnnotationBody;
  
  iiifMetadata?: CozyMetadata[]; 

  onUpdateMetadata(body: W3CAnnotationBody): void;

  onOpen(): void;

}

const MetadataList = (props: MetadataListProps) => {

  const { customMetadata, iiifMetadata } = props;

  const [tab, setTab] = useState<string>('custom'); 

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(props.customMetadata);    
  }, [props.customMetadata]);

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    props.onUpdateMetadata(formState);
  }

  return (
    <Tabs 
      value={tab}
      onValueChange={setTab}
      className="h-full flex flex-col">
      <TabsList className="grid grid-cols-2 mr-24 w-auto p-1 h-auto">
        <TabsTrigger 
          value="custom" 
          className="text-xs py-1 px-2 flex gap-1.5">
          <NotebookPen className="size-3.5" /> My
        </TabsTrigger>

        <TabsTrigger 
          value="embedded"
          className="text-xs py-1 px-2 flex gap-1.5"> 
          <Braces className="size-3.5" />IIIF
        </TabsTrigger>
      </TabsList>

      <TabsContent 
        value="embedded"
        className="grow">
        {iiifMetadata ? (
          <IIIFMetadataList metadata={iiifMetadata} />
        ) : null}
      </TabsContent>

      <TabsContent
        value="custom"
        className="grow">
        <PropertyValidation>
          <form 
            className="flex flex-col justify-between h-full pt-4"
            onSubmit={onSubmit}>
            <div className="flex flex-col grow">
              {props.folder ? (
                <FolderMetadataForm
                  metadata={formState}
                  onChange={setFormState} />
              ) : (
                <ImageMetadataForm
                  metadata={formState}
                  onChange={setFormState} />
              )}
            </div>

            <div className="pt-2 pb-2">        
              <Button 
                disabled={!hasChanges(customMetadata, formState)} 
                className="w-full mb-2"
                type="submit">
                Save
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                type="button"
                onClick={props.onOpen}>
                <PanelTop className="h-4 w-4 mr-2" /> Open Image
              </Button>
            </div>
          </form>
        </PropertyValidation>
      </TabsContent>
    </Tabs>
  )

}

export const IIIFManifestMetadataPanel = ({ item }: { item: IIIFManifestResource }) => {

  const manifest = useIIIFResource(item.id);

  const { metadata, updateMetadata } = useManifestMetadata(item.id);

  const iiifMetadata = useMemo(() => {
    if (!manifest) return;
    return manifest.getMetadata();
  }, [manifest]);

  return (
    <div className="px-4 py-3 h-full">
      <MetadataList 
        folder
        customMetadata={metadata}
        iiifMetadata={iiifMetadata} 
        onUpdateMetadata={updateMetadata} 
        onOpen={() => {}} />
    </div>
  )
  
}

export const IIIFCanvasMetadataPanel = ({ item }: { item: CanvasGridItem }) => {

  const id = `iiif:${item.info.manifestId}:${item.info.id}`;

  const { metadata, updateMetadata } = useImageMetadata(id);

  const navigate = useNavigate();

  const onOpen = () => navigate(`/annotate/${id}`);

  return (
    <div className="px-4 py-3 h-full">
      <MetadataList
        customMetadata={metadata}
        iiifMetadata={item.canvas.getMetadata()} 
        onUpdateMetadata={updateMetadata} 
        onOpen={onOpen} />
    </div>
  )

}