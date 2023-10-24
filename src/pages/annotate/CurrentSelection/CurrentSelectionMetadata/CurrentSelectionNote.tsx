import { useState } from 'react';
import { useFormik } from 'formik';
import { PlusCircle } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { Textarea } from '@/ui/Textarea';
import { Label } from '@/ui/Label';

interface CurrentSelectionNoteProps {

  defaultOpen?: boolean;

  body?: W3CAnnotationBody;

  safeKey: string;

  formik: ReturnType<typeof useFormik>;

}

export const CurrentSelectionNote = (props: CurrentSelectionNoteProps) => {

  const { formik, safeKey } = props;

  const [showNote, setShowNote] = useState(Boolean(props.body) || props.defaultOpen);

  return showNote ? (
    <div>
      <Label 
        htmlFor={safeKey}
        className="text-xs block mb-1 mt-3">Note</Label>

      <Textarea 
        id={safeKey}
        className="mt-2 mb-2"
        rows={8}
        value={formik.values[safeKey]} 
        onChange={formik.handleChange} />
    </div>
  ) : (
    <div className="mt-3">
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