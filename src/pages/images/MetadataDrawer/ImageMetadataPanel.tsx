import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dequal } from 'dequal/lite';
import { useImageMetadata } from '@/store';
import { ImageGridItem } from '../ItemGrid';
import { PropertyValidation } from '@/components/PropertyFields';
import { Button } from '@/ui/Button';
import { PanelTop } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { ImageMetadataForm } from '@/components/ImageMetadataForm';

interface ImageMetadataPanelProps {

  image: ImageGridItem;

}

const hasChanges = (a: W3CAnnotationBody, b: W3CAnnotationBody) => {
  if (a === undefined && b === undefined)
    return false;

  const propertiesA = a && 'properties' in a ? a.properties : {};
  const propertiesB = b && 'properties' in b ? b.properties : {};

  return !dequal(propertiesA, propertiesB);
}

export const ImageMetadataPanel = (props: ImageMetadataPanelProps) => {

  const navigate = useNavigate();

  const { metadata, updateMetadata } = useImageMetadata(props.image?.id);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSave = () => updateMetadata(formState);

  const onOpen = () => navigate(`/annotate/${props.image.id}`);

  return (
    <PropertyValidation>
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col flex-grow">
          <h2 className="leading-relaxed mr-5 mb-8 font-medium">
            {props.image.name}
          </h2>
          
          <ImageMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

        <div className="pt-2 pb-4">        
          <Button 
            disabled={!hasChanges(metadata, formState)} 
            className="w-full mb-2"
            onClick={onSave}>
            Save Metadata
          </Button>

          <Button 
            variant="outline"
            className="w-full"
            onClick={onOpen}>
            <PanelTop className="h-4 w-4 mr-2" /> Open Image
          </Button>
        </div>
      </div>
    </PropertyValidation>
  )

}