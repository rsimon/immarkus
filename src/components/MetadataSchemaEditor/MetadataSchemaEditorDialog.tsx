import { ReactNode, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { MetadataSchemaEditor } from './MetadataSchemaEditor';
import { MetadataSchema } from '@/model';

interface MetadataSchemaEditorDialogProps {

  editorHint: string;

  existingSchemas: MetadataSchema[];

  previewHint: string;

  children?: ReactNode;

  open?: boolean;

  schema?: MetadataSchema;

  onSave(schema: MetadataSchema, previous?: MetadataSchema): void;

  onOpenChange?(open: boolean): void;

}

export const MetadataSchemaEditorDialog = (props: MetadataSchemaEditorDialogProps) => {

  const [open, setOpen] = useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onOpenChange)
      props.onOpenChange(open);
  }

  const onSave = (schema: MetadataSchema, previous?: MetadataSchema) => {
    props.onSave(schema, previous);
    onOpenChange(false);
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      {props.children && (
        <DialogTrigger asChild>
          {props.children}
        </DialogTrigger>
      )}

      <DialogContent className="p-0 max-w-3xl my-8 rounded-lg">
        <DialogTitle className="sr-only">
          Edit Schema
        </DialogTitle>

        <DialogDescription className="sr-only">
          {props.editorHint}
        </DialogDescription>

        <MetadataSchemaEditor 
          editorHint={props.editorHint} 
          previewHint={props.previewHint} 
          schema={props.schema}
          existingSchemas={props.existingSchemas}
          onSave={onSave} />
      </DialogContent>
    </Dialog>
  )
}