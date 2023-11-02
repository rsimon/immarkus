import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { Textarea } from '@/ui/Textarea';
import { Label } from '@/ui/Label';

interface CurrentSelectionNoteProps {

  defaultOpen?: boolean;

  id: string;

  value: string;

  onChange(note: string): void;

}

export const CurrentSelectionNote = (props: CurrentSelectionNoteProps) => {

  const [showNote, setShowNote] = useState(Boolean(props.value) || props.defaultOpen);

  return showNote ? (
    <div>
      <Label 
        htmlFor={props.id}
        className="text-xs block mb-1 mt-3">Note</Label>

      <Textarea 
        id={props.id}
        className="mb-2"
        rows={4}
        value={props.value || ''} 
        onChange={evt => props.onChange(evt.target.value)} />
    </div>
  ) : (
    <div className="mb-2">
      <Button 
        variant="ghost" 
        type="button"
        className="text-xs px-1.5 py-3.5 h-6 font-normal rounded-full whitespace-nowrap -ml-1.5"
        onClick={() => setShowNote(true)}>
        <PlusCircle className="h-4 w-4 mr-1" /> Add Note
      </Button>
    </div>
  )

}