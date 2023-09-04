import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { W3CAnnotation } from '@annotorious/react';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { useStore } from '@/store';
import { EditorPaneProps } from '..';

export const NotesTab = (props: EditorPaneProps) => {

  const { image } = props;

  const store = useStore();

  const textarea = useRef<HTMLTextAreaElement>();

  const metadata: W3CAnnotation | undefined = 
    // @ts-ignore
    store.getAnnotations(image.id).find(a => !a.target.selector);

  const note = metadata ?
    Array.isArray(metadata.body) ? 
      (metadata.body.find(b => !b.purpose).value || '') : 
      (metadata.body?.value || '') : '';

  const onSaveNote = (evt: React.FormEvent) => {
    evt.preventDefault();

    const next: W3CAnnotation = metadata ? {
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
        source: image.id
      }
    };

    props.onSaving();
    store.upsertAnnotation(image.id, next)
      .then(() => props.onSaved())
      .catch(error => props.onError(error));
  }

  return (
    <form onSubmit={onSaveNote}>
      <Textarea 
        ref={textarea} 
        className="mb-2"
        rows={10}
        defaultValue={note} />
      
      <div className="text-right">
        <Button>Save</Button>
      </div>
    </form>
  )

}