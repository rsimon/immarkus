import { ChangeEvent, useRef } from 'react';
import { Button } from '@/ui/Button';
import { EntityType } from '@/model';
import { validateEntityTypes } from './useImportModel';

interface UploadButtonProps {

  onError(error: string): void;

  onUpload(types: EntityType[]): void;

}

export const UploadButton = (props: UploadButtonProps) => {

  const inputEl = useRef<HTMLInputElement>(null);

  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function(e) {
        try {
          const content = JSON.parse(e.target.result as string);

          if (validateEntityTypes(content))
            props.onUpload(content);
          else
            props.onError('Invalid data model format');
        } catch (error) {
          props.onError('Could not open the data file');
        }
      };

      reader.readAsText(file);
    }
  }

  return (
    <>
      <input 
        ref={inputEl}
        className="hidden" 
        type="file" 
        id="upload" 
        accept=".json" 
        onChange={onChange} />

      <Button 
        className="w-full"
        onClick={() => inputEl.current.click()}>Upload Datamodel File</Button>
    </>
  )

}