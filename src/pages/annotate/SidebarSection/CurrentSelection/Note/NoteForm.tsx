import { ScanText } from 'lucide-react';
import { User } from '@annotorious/react';
import TextareaAutosize from 'react-textarea-autosize';

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
      <TextareaAutosize
        cacheMeasurements
        autoFocus={props.autoFocus}
        id={props.id}
        minRows={4}
        maxRows={20}
        value={props.value || ''} 
        className="shadow-xs w-full outline-black rounded-md border border-input p-2 bg-muted text-base placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        onChange={evt => props.onChange(evt.target.value)} />
    </div>
  )

}