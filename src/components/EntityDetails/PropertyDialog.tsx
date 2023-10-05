import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/Dialog';
import { PropertyDetails, PropertyDetailsProps } from '../PropertyDetails';

export const PropertyDialog = (props: PropertyDetailsProps) => {

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-black">
          <Settings className="w-3.5 h-3.5 " />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Define a schema property for this entity type.
          </DialogDescription>
        </DialogHeader>

        <PropertyDetails {...props} />

        <DialogFooter className="mt-2 sm:justify-start">
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}