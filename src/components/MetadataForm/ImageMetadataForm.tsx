import { W3CAnnotationBody } from '@annotorious/react';
import { useDataModel } from '@/store';
import { MetadataForm } from './MetadataForm';

interface ImageMetadataFormProps {

  metadata: W3CAnnotationBody;

  onChange(metadata: W3CAnnotationBody): void;

}

export const ImageMetadataForm = (props: ImageMetadataFormProps) => {

  const { metadata } = props;

  const model = useDataModel();
  
  return (
    <MetadataForm 
      metadata={metadata}
      schemas={model.imageSchemas} 
      onChange={props.onChange} />
  )

}