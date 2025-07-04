import { ScanText } from 'lucide-react';
import { User } from '@annotorious/react';
import { Textarea } from '@/ui/Textarea';

interface NoteProps {

  autoFocus?: boolean;

  id: string;

  creator?: User; 

  value: string;

  onChange(note: string): void;

}

export const Note = (props: NoteProps) => {

  const { creator } = props;

  const hasGenerator = creator?.name && 'type' in creator;

  return (
    <div className="mt-3">
      {hasGenerator && (
        <div className="text-[11px] flex gap-1 items-center justify-end mb-1.5 mr-0.5 text-muted-foreground/80">
          {creator.name} <ScanText className="size-3.5 mb-[1px]" /> 
        </div>
      )}
      <Textarea
        autoFocus={props.autoFocus}
        id={props.id}
        rows={4}
        value={props.value || ''} 
        onChange={evt => props.onChange(evt.target.value)} />
    </div>
  )

}