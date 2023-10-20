import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { EntityDetails } from './EntityDetails';
import { ReactNode } from 'react';

interface EntityDetailsDialogProps {

  children: ReactNode;

}

export const EntityDetailsDialog = (props: EntityDetailsDialogProps) => {

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>

      <DialogContent className="p-0 max-w-3xl rounded-lg">
        <EntityDetails 
          onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )

}