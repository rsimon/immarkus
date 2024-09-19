import { ReactNode, useEffect, useState } from 'react';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { useToast } from '@/ui/Toaster';

interface RelationshipTypeEditorProps {

  children?: ReactNode;

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const RelationshipTypeEditor = (props: RelationshipTypeEditorProps) => {

  const { toast } = useToast();

  const { addRelationshipType } =  useDataModel();

  const [open, setOpen] = useState(props.open);

  const [value, setValue] = useState('');

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onOpenChange)
      props.onOpenChange(open);
  }

  const onSave = () => {
    setOpen(false);
    
    if (value) {
      addRelationshipType(value)
        .catch(error => {
          console.error(error);

          toast({
            variant: 'destructive',
            // @ts-ignore
            title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> Error</ToastTitle>,
            description: 'Something went wrong. Could not save entity type.'
          });  
        });
    }

    setValue('');
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

      <DialogContent className="px-8 py-3 max-md my-8 rounded-lg">
        <DialogTitle className="hidden">
          New Relationship Type
        </DialogTitle>
        
        <DialogDescription className="hidden">
          Enter a new relationship type below.
        </DialogDescription>

        <form onSubmit={evt => evt.preventDefault()}>
          <div className="mt-6">
            <Label 
              htmlFor="relationship-type"
              className="inline-block text-xs mb-1.5 ml-0.5">Relationship Type
            </Label>

            <Input
              id="relationship-type"
              className="bg-white"
              value={value}
              onChange={evt => setValue(evt.target.value)} />
          </div>

          <Button 
            className="w-full mt-4 mb-3"
            disabled={!value}
            onClick={onSave}>
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )


}