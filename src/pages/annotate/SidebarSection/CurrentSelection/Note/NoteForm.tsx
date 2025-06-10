import { Textarea } from '@/ui/Textarea';

interface NoteProps {

  autoFocus?: boolean;

  id: string;

  value: string;

  onChange(note: string): void;

}

export const Note = (props: NoteProps) => {

  return (
    <div className="mt-4">
      <Textarea 
        autoFocus={props.autoFocus}
        id={props.id}
        rows={4}
        value={props.value || ''} 
        onChange={evt => props.onChange(evt.target.value)} />
    </div>
  )

}