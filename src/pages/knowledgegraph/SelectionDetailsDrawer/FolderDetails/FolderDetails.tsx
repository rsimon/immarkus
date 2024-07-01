import { FormEvent, useEffect, useState } from 'react';
import { Folder } from '@/model';
import { useFolderMetadata } from '@/store';
import { W3CAnnotationBody } from '@annotorious/react';
import { PropertyValidation } from '@/components/PropertyFields';
import { FolderMetadataForm, hasChanges } from '@/components/MetadataForm';
import { Button } from '@/ui/Button';

interface FolderDetailsProps {

  folder: Folder;

}

export const FolderDetails = (props: FolderDetailsProps) => {

  const { metadata, updateMetadata } = useFolderMetadata(props.folder);

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
        className="flex-grow flex flex-col justify-betwee p-3 pt-14 pb-2"
        onSubmit={onSubmit}>
        <div className="flex flex-col flex-grow">          
          <FolderMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

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