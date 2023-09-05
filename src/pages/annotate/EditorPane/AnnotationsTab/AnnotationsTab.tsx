import { useRef } from 'react';
import { createBody, useAnnotationStore, useSelection } from '@annotorious/react';
import { Trash2 } from 'lucide-react';
import { EditorPaneProps } from '..';
import { Textarea } from '@/components/Textarea';
import { Button } from '@/components/Button';
import { DeleteWithConfirmation } from './DeleteWithConfirmation';

export const AnnotationsTab = (props: EditorPaneProps) => {

  const textarea = useRef<HTMLTextAreaElement>();

  const store = useAnnotationStore()

  const { selected } = useSelection();

  const empty = selected.length === 0;

  const comment = selected.length > 0 ? 
    selected[0].bodies.find(b => b.purpose === 'commenting')?.value : '';

  const onSave = (evt: React.FormEvent) => {
    evt.preventDefault()

    const annotation = selected[0];

    const comment = createBody(selected[0], {
      value: textarea.current.value,
      purpose: 'commenting'
    });

    const updated = {
      ...annotation,
      bodies: [
        ...annotation.bodies.filter(b => b.purpose !== 'commenting'),
        comment
      ]
    };

    store.updateAnnotation(updated);
  }

  const onDelete = () =>
    store.bulkDeleteAnnotation(selected);

  return empty ? (
    <div className="flex rounded text-sm justify-center items-center w-full text-muted-foreground">
      No annotation selected
    </div> 
  ) : (
    <div className="w-full" key={selected.map(a => a.id).join('.')}>
      <form onSubmit={onSave}>
        <fieldset>
          <h2 className="text-sm font-medium">
            Comment
          </h2>

          <Textarea 
            ref={textarea}
            className="mt-2 mb-4" 
            rows={6} 
            defaultValue={comment}/>
        </fieldset>

        <fieldset>
          <h2 className="text-sm font-medium">
            Tags
          </h2>
        </fieldset>

        <fieldset>
          <h2 className="text-sm font-medium">
            Relations
          </h2>
        </fieldset>

        <div className="flex mt-2">
          <Button type="submit">
            Save
          </Button>

          <DeleteWithConfirmation 
            onDelete={onDelete} />
        </div>
      </form>
    </div>
  )

}