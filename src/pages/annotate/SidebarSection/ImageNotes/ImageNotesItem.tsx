import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { W3CAnnotation } from '@annotorious/react';
import { Image } from '@/model';
import { useAnnotations, useImageMetadata, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Textarea } from '@/ui/Textarea';
import { useSavingState } from '../../SavingState';

interface ImageNotesItemProps {

  image: Image;

}

export const ImageNotesItem = (props: ImageNotesItemProps) => {

  const textarea = useRef<HTMLTextAreaElement>();

  const store = useStore();

  const { setSavingState } = useSavingState();

  const metadata = useImageMetadata(props.image.id);

  const note = metadata ?
    Array.isArray(metadata.body) ? 
      (metadata.body.find(b => !b.purpose).value || '') : 
      (metadata.body?.value || '') : '';

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    const updated: W3CAnnotation = metadata ? {
      ...metadata,
      body: {
        value: textarea.current.value
      }
    } : {
      '@context': 'http://www.w3.org/ns/anno.jsonld',
      type: 'Annotation',
      id: uuidv4(),
      body: {
        value: textarea.current.value
      },
      target: {
        source: props.image.id
      }
    };

    setSavingState({ value: 'saving' });

    store
      .upsertAnnotation(props.image.id, updated)
      .then(() => setSavingState({ value: 'success' }))
      .catch((error: Error) => { 
        console.error(error);
        
        setSavingState({ 
          value: 'failed',
          message: `Could not save image note. Error: ${error.message}`
        });
      });
  }
  
  return (
    <form onSubmit={onSubmit} className="grow">
      <Textarea 
        ref={textarea} 
        className="mb-3"
        rows={10}
        defaultValue={note} />
      
      <div>
        <Button>Save</Button>
      </div>
    </form>
  )

}