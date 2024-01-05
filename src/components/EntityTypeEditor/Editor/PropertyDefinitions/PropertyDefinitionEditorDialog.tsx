import { ReactNode, useEffect, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { PropertyDefinitionEditor } from './PropertyDefinitionEditor';
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from '@/ui/Dialog';

interface PropertyEditorDialogProps {

  property?: PropertyDefinition

  onSave(definition: PropertyDefinition): void;

  onClose?(): void;

  children: ReactNode;

}

export const PropertyEditorDialog = (props: PropertyEditorDialogProps) => {

  const [open, setOpen] = useState(false);

  const onUpdate = (property: PropertyDefinition) => {
    props.onSave(property);
    setOpen(false);

    if (props.onClose)
      props.onClose();  
  }

  const onOpenStateChange = (open: boolean) => {
    setOpen(open);
    
    if (!open && props.onClose)
      props.onClose();  
  }

  return (
    <Dialog open={open} onOpenChange={onOpenStateChange}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>

      <DialogContent className="p-0 max-w-4xl my-8 rounded-lg">
        <PropertyDefinitionEditor 
          property={props.property} 
          onSave={onUpdate} />
      </DialogContent>
    </Dialog>
  )

}