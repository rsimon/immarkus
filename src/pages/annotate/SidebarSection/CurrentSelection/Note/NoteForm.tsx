import { Label } from '@/ui/Label';
import { Textarea } from '@/ui/Textarea';

interface NoteProps {

  id: string;

  value: string;

  onChange(note: string): void;

}

export const Note = (props: NoteProps) => {

  return (
    <div className="mt-4">
      <Textarea 
        id={props.id}
        rows={4}
        value={props.value || ''} 
        onChange={evt => props.onChange(evt.target.value)} />
    </div>
  )

}