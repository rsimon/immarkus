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

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Entity Property</DialogTitle>
          <DialogDescription className="leading-relaxed">
            <p>
              Enter a name and type for the property.
              E.g. name: <strong>Age</strong>, type: <strong>Number</strong>. 
            </p>

            <p className="mt-2">
              The <strong>Options</strong> type allows you to define a fixed 
              set of choices. E.g. name: <strong>Material</strong>,
              options: <strong>Clay</strong>, <strong>Metal</strong>, <strong>Wood</strong>.
            </p>
          </DialogDescription>
        </DialogHeader>

        <PropertyDetails 
          property={props.property} 
          onUpdate={onUpdate} />
      </DialogContent>
    </Dialog>
  )

}