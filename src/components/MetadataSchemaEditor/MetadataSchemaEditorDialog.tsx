import { ReactNode, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { useToast } from '@/ui/Toaster';
import { MetadataSchemaEditor } from './MetadataSchemaEditor';
import { MetadataSchema } from '@/model';

interface MetadataSchemaEditorDialogProps {

  caption: string;

  editorHint: string;

  previewHint: string;

  children: ReactNode;

  open?: boolean;

  onChange(updated: MetadataSchema): void;

  onOpenChange?(open: boolean): void;

}

export const MetadataSchemaEditorDialog = (props: MetadataSchemaEditorDialogProps) => {

  const { toast } = useToast();

  const [open, setOpen] = useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onOpenChange)
      props.onOpenChange(open);
  }

  const onSaveError = (error: Error) => {
    console.error(error);
    
    toast({
      variant: 'destructive',
      // @ts-ignore
      title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> Error</ToastTitle>,
      description: 'Something went wrong. Could not save schema.'
    });   
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

      <DialogContent className="p-0 max-w-4xl my-8 rounded-lg">
        <MetadataSchemaEditor 
          caption={props.caption} 
          editorHint={props.editorHint} 
          previewHint={props.previewHint} 
          onChange={props.onChange} />
      </DialogContent>
    </Dialog>
  )
}