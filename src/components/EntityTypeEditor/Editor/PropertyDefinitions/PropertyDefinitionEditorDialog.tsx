import { ReactNode, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { PropertyDefinitionEditor } from './PropertyDefinitionEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/ui/Dialog';

interface PropertyEditorDialogProps {

  property?: PropertyDefinition

  onSave(definition: PropertyDefinition): void;

  children: ReactNode;

}

export const PropertyEditorDialog = (props: PropertyEditorDialogProps) => {

  const [open, setOpen] = useState(false);

  const onUpdate = (property: PropertyDefinition) => {
    props.onSave(property);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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