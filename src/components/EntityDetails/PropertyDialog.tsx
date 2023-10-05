import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/Dialog';
import { PropertyDetails } from '../PropertyDetails';
import { EntityProperty } from '@/model';

interface PropertyDialogProps {

  property?: EntityProperty

  onUpdate(updated: EntityProperty): void;

  children: ReactNode;

}

export const PropertyDialog = (props: PropertyDialogProps) => {

  const [open, setOpen] = useState(false);

  const onUpdate = (property: EntityProperty) => {
    props.onUpdate(property);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Define a schema property for this entity type.
          </DialogDescription>
        </DialogHeader>

        <PropertyDetails 
          property={props.property} 
          onUpdate={onUpdate} />
      </DialogContent>
    </Dialog>
  )

}