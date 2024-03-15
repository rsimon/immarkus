import { W3CAnnotationBody } from '@annotorious/react';
import { useDataModel } from '@/store';
import { MetadataForm } from './MetadataForm';

interface FolderMetadataFormProps {

  metadata: W3CAnnotationBody;

  onChange(metadata: W3CAnnotationBody): void;

}

export const FolderMetadataForm = (props: FolderMetadataFormProps) => {

  const { metadata } = props;

  const model = useDataModel();
  
  return (
    <MetadataForm 
      metadata={metadata}
      schemas={model.folderSchemas} 
      onChange={props.onChange} />
  )

}