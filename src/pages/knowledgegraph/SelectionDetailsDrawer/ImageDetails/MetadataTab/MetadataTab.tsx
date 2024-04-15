import { ImageMetadataForm } from '@/components/MetadataForm';
import { PropertyValidation } from '@/components/PropertyFields';
import { Image } from '@/model';
import { ImageMetadataPanel } from '@/pages/images/MetadataDrawer/ImageMetadataPanel';
import { useImageMetadata } from '@/store';

interface MetadataTabProps {

  image: Image;

}

export const MetadataTab = (props: MetadataTabProps) => {

  return (
    <ImageMetadataPanel
      image={props.image} />
  )

}