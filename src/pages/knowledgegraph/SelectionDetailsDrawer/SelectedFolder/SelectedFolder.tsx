import { FormEvent, useEffect, useState } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { PropertyValidation } from '@/components/PropertyFields';
import { FolderMetadataForm, hasChanges } from '@/components/MetadataForm';
import { Folder } from '@/model';
import { useFolderMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { X } from 'lucide-react';

interface SelectedFolderProps {

  folder: Folder;

  onClose(): void;

}

export const SelectedFolder = (props: SelectedFolderProps) => {

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
      <div className="p-2">
        <form 
          className="bg-white relative rounded border shadow-sm min-h-56 flex flex-col p-3 pt-12"
          onSubmit={onSubmit}>

          <Button 
            className="absolute h-8 w-8 right-1.5 top-1.5 rounded-full"
            size="icon"
            variant="ghost"
            onClick={props.onClose}>
            <X className="h-4 w-4" />
          </Button>

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
      </div>
    </PropertyValidation> 
  )

}