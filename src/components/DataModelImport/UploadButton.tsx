import { ChangeEvent, useRef } from 'react';
import { Button } from '@/ui/Button';

export const UploadButton = () => {

  const inputEl = useRef<HTMLInputElement>(null);

  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function(e) {
        try {
          const content = JSON.parse(e.target.result as string);
          console.log('JSON content:', content);
        } catch (error) {
          console.error(error);
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