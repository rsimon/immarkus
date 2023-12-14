import { ReactNode, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { PropertyEditor } from './PropertyEditor';
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

  onUpdate(updated: PropertyDefinition): void;

  children: ReactNode;

}

export const PropertyEditorDialog = (props: PropertyEditorDialogProps) => {

  const [open, setOpen] = useState(false);

  const onUpdate = (property: PropertyDefinition) => {
    props.onUpdate(property);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-left">Entity Property</DialogTitle>
          <DialogDescription asChild>
            <div className="text-left text-sm leading-relaxed">
              <p>
                Enter a name and type for the property.
                E.g. name: <strong>Age</strong>, type: <strong>Number</strong>. 
              </p>

              <p className="mt-2">
                The <strong>Options</strong> type allows you to define a fixed 
                set of choices. E.g. name: <strong>Material</strong>,
                options: <strong>Clay</strong>, <strong>Metal</strong>, <strong>Wood</strong>.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <PropertyEditor 
          property={props.property} 
          onUpdate={onUpdate} />
      </DialogContent>
    </Dialog>
  )

}