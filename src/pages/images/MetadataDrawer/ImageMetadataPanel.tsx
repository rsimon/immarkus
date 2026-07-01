import { SubmitEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageMetadata } from '@/store';
import { PropertyValidation } from '@/components/PropertyFields';
import { Button } from '@/ui/Button';
import { ImagePlus, PanelTop } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { ImageMetadataForm, hasChanges } from '@/components/MetadataForm';
import { Image } from '@/model';
import { useOpenInAnnotationView } from '@/pages/annotate/AnnotationViewState';

interface ImageMetadataPanelProps {

  image: Image;

}

export const ImageMetadataPanel = (props: ImageMetadataPanelProps) => {

  const { t } = useTranslation('images');

  const { metadata, updateMetadata } = useImageMetadata(props.image?.id);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  const { openInAnnotationView, addToAnnotationView } = useOpenInAnnotationView();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSubmit = (evt: SubmitEvent<HTMLFormElement>) => {
    evt.preventDefault();
    updateMetadata(formState);
  }

  return (
    <PropertyValidation>
      <form 
        className="flex flex-col justify-between h-full py-3 px-4"
        onSubmit={onSubmit}>
        <div className="flex flex-col grow">
          <h2 className="leading-relaxed mr-5 mb-8 font-medium whitespace-nowrap overflow-hidden truncate">
            {props.image.name}
          </h2>
          
          <ImageMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

        <div className="pt-2 pb-4 space-y-2">        
          <Button 
            disabled={!hasChanges(metadata, formState)} 
            className="w-full"
            type="submit">
            {t('common.save')}
          </Button>

          <Button 
            variant="outline"
            className="w-full"
            type="button"
            onClick={() => openInAnnotationView(props.image.id)}>
            <PanelTop className="size-4 mr-2" /> {t('common.openImage')}
          </Button>

          <Button 
            variant="outline"
            className="w-full"
            type="button"
            onClick={() => addToAnnotationView(props.image.id)}>
            <ImagePlus className="size-4 mr-2" /> {t('common.addToWorkspace')}
          </Button>
        </div>
      </form>
    </PropertyValidation>
  )

}