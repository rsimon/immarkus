import { SubmitEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Braces, ImagePlus, NotebookPen, PanelTop } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { PropertyValidation } from '@/components/PropertyFields';
import { FolderMetadataForm, hasChanges, ImageMetadataForm } from '@/components/MetadataForm';
import { IIIFMetadataList } from '@/components/IIIFMetadataList';
import { IIIFManifestResource } from '@/model';
import { useImageMetadata, useManifestMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { Annotation, CozyMetadata } from 'cozy-iiif';
import { getCanvasAnnotations } from '@/utils/iiif';
import { useCanvas, useIIIFResource } from '@/utils/iiif/hooks';
import { CanvasItem } from '../Types';
import { useOpenInAnnotationView } from '@/pages/annotate';

interface MetadataListProps {

  folder?: boolean;

  customMetadata: W3CAnnotationBody;
  
  iiifMetadata?: CozyMetadata[]; 

  iiifAnnotations?: Annotation[];

  onUpdateMetadata(body: W3CAnnotationBody): void;

  onOpen?(): void;

  onAddToWorkspace?(): void;

}

const MetadataList = (props: MetadataListProps) => {

  const { t } = useTranslation('images');

  const { customMetadata, iiifMetadata } = props;

  const [tab, setTab] = useState<string>('embedded'); 

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(props.customMetadata);    
  }, [props.customMetadata]);

  const onSubmit = (evt: SubmitEvent<HTMLFormElement>) => {
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
          value="embedded"
          className="text-xs py-1 px-2 flex gap-1.5"> 
          <Braces className="size-3.5" />{t('metadataPanel.iiifTab')}
        </TabsTrigger>

        <TabsTrigger
          value="custom"
          className="text-xs py-1 px-2 flex gap-1.5">
          <NotebookPen className="size-3.5" /> {t('metadataPanel.myTab')}
        </TabsTrigger>
      </TabsList>

      <TabsContent 
        value="embedded"
        className="grow">
        {iiifMetadata ? (
          <IIIFMetadataList 
            annotations={props.iiifAnnotations}
            metadata={iiifMetadata} />
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

            <div className="pt-2 pb-2 space-y-2">        
              <Button 
                disabled={!hasChanges(customMetadata, formState)} 
                className="w-full"
                type="submit">
                {t('common.save')}
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                type="button"
                onClick={props.onOpen}>
                <PanelTop className="size-4 mr-2" /> {t('common.openImage')}
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                type="button"
                onClick={props.onAddToWorkspace}>
                <ImagePlus className="size-4 mr-2" /> {t('common.addToWorkspace')}
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
        onUpdateMetadata={updateMetadata} />
    </div>
  )
  
}

export const IIIFCanvasMetadataPanel = ({ item }: { item: CanvasItem }) => {

  const id = `iiif:${item.info.manifestId}:${item.info.id}`;

  const { metadata, updateMetadata } = useImageMetadata(id);

  const canvas = useCanvas(id);

  const { openInAnnotationView, addToAnnotationView } = useOpenInAnnotationView();

  const annotations = useMemo(() => {
    if (!canvas) return [];
    return getCanvasAnnotations(canvas.annotations);
  }, [canvas]);

  return (
    <div className="px-4 py-3 h-full">
      <MetadataList
        customMetadata={metadata}
        iiifAnnotations={annotations}
        iiifMetadata={item.canvas.getMetadata()} 
        onUpdateMetadata={updateMetadata} 
        onOpen={() => openInAnnotationView(id)} 
        onAddToWorkspace={() => addToAnnotationView(id)} />
    </div>
  )

}