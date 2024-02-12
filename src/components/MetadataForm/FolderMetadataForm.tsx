import { ToyBrick } from 'lucide-react';
import { Link } from 'react-router-dom';
import { W3CAnnotationBody } from '@annotorious/react';
import { useDataModel } from '@/store';
import { MetadataForm } from './MetadataForm';

interface FolderMetadataFormProps {

  metadata: W3CAnnotationBody;

  onChange(metadata: W3CAnnotationBody): void;

}

export const FolderMetadataForm = (props: FolderMetadataFormProps) => {

  const model = useDataModel();

  const { metadata } = props;

  const schema = metadata && model.getFolderSchema('default');

  return schema ? (
    <MetadataForm 
      metadata={metadata} 
      properties={schema.properties}
      onChange={props.onChange} />
  ) : (
    <div className="flex flex-col text-sm items-center px-2 justify-center text-center flex-grow leading-loose text-muted-foreground">
      <span>
        No folder metadata model.<br/>
        Go to <Link to="/model" className="inline-block text-black hover:bg-muted px-1 rounded-sm"><ToyBrick className="inline h-4 w-4 align-text-top" /> Data Model</Link> to 
        define one.
      </span>
    </div>
  )

}