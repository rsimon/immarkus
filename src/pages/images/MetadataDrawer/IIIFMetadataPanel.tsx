import { FormEvent, useEffect, useMemo, useState } from 'react';
import { NotebookPen, PanelTop, PenOff } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { PropertyValidation } from '@/components/PropertyFields';
import { IIIFManifestResource } from '@/model';
import { useImageMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { CozyMetadata } from '@/utils/cozy-iiif';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { CanvasGridItem } from '../Types';
import { hasChanges, ImageMetadataForm } from '@/components/MetadataForm';
import { useNavigate } from 'react-router-dom';

interface MetadataListProps {

  title?: string;

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
      <TabsList className="gap-2 bg-transparent justify-start px-5 pt-6">
        <TabsTrigger 
          value="custom" 
          className="flex gap-1 transition-none px-2.5 py-1.5 pr-3 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white">
          <NotebookPen size={15} className="mx-1" /> My Metadata
        </TabsTrigger>

        <TabsTrigger 
          value="embedded" 
          className={`flex gap-1 transition-none pl-2 ${tab === 'metadata' ? 'pr-3' : 'pr-2'} py-1.5 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white`}>
          <PenOff size={15} className="mx-1" />IIIF
        </TabsTrigger>
      </TabsList>

      <TabsContent 
        value="embedded"
        className="flex-grow">
        {iiifMetadata ? (
          iiifMetadata.length > 0 ? (
            <ul className="h-full space-y-4 text-sm leading-relaxed py-2 px-2.5">
              {props.iiifMetadata.map(({ label, value }, index) => (
                <li key={`${label}:${index}`}>
                  <div 
                    className="font-semibold">
                    {label}
                  </div>
                  
                  <div 
                    className="pl-4 [&_a]:text-sky-700 [&_a]:hover:underline"
                    dangerouslySetInnerHTML={{ __html: value || '' }} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No IIIF Metadata
            </div>
          )
        ) : null}
      </TabsContent>

      <TabsContent
        value="custom"
        className="flex-grow">
        <PropertyValidation>
          <form 
            className="flex flex-col justify-between h-full py-4 px-6"
            onSubmit={onSubmit}>
            <div className="flex flex-col flex-grow">
              {props.title && (
                <h2 className="leading-relaxed mr-5 mb-8 font-medium">
                  {props.title}
                </h2>
              )}
              
              <ImageMetadataForm
                metadata={formState}
                onChange={setFormState} />
            </div>

            <div className="pt-2 pb-4">        
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


  // const { metadata, updateMetadata } = useFolderMetadata(item.id);

  const iiifMetadata = useMemo(() => {
    if (!manifest) return;
    return manifest.getMetadata();
  }, [manifest]);

  return (
    <MetadataList 
      // customMetadata={metadata}
      iiifMetadata={iiifMetadata} 
      /* onUpdateMetadata={updateMetadata} */ />
  )

}

export const IIIFCanvasMetadataPanel = ({ item }: { item: CanvasGridItem }) => {

  const id = `iiif:${item.info.manifestId}:${item.info.id}`;

  const navigate = useNavigate();

  const { metadata, updateMetadata } = useImageMetadata(id);

  const onOpen = () => navigate(`/annotate/${id}`);

  return (
    <MetadataList 
      title={item.canvas.getLabel()}
      customMetadata={metadata}
      iiifMetadata={item.canvas.getMetadata()} 
      onUpdateMetadata={updateMetadata} 
      onOpen={onOpen} />
  )

}