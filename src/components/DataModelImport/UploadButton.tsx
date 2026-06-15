import { ChangeEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/Button';
import { EntityType } from '@/model';

interface UploadButtonProps {

  validation: ((data: any) => boolean);

  onError(error: string): void;

  onUpload(types: EntityType[]): void;

}

export const UploadButton = (props: UploadButtonProps) => {

  const { t } = useTranslation('common');

  const inputEl = useRef<HTMLInputElement>(null);

  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function(e) {
        try {
          const content = JSON.parse(e.target.result as string);

          if (props.validation(content))
            props.onUpload(content);
          else
            props.onError(t('dataModelImport.invalidFormat'));
        } catch (error) {
          props.onError(t('dataModelImport.couldNotOpenFile'));
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
        onClick={() => inputEl.current.click()}>{t('dataModelImport.uploadButton')}</Button>
    </>
  )

}