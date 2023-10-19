import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { EntityDetails } from './EntityDetails';
import { ReactNode } from 'react';

interface EntityDetailsDialogProps {

  children: ReactNode;

}

export const EntityDetailsDialog = (props: EntityDetailsDialogProps) => {

  return (
    <Dialog>
      <DialogTrigger>
        {props.children}
      </DialogTrigger>

      <DialogContent className="p-0 max-w-3xl rounded-lg">
        <EntityDetails />
      </DialogContent>
    </Dialog>
  )

}