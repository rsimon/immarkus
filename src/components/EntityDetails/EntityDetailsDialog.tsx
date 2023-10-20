import { ReactNode, useEffect, useState } from 'react';
import { Entity } from '@/model';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { EntityDetails } from './EntityDetails';

interface EntityDetailsDialogProps {

  children?: ReactNode;

  entity?: Entity

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const EntityDetailsDialog = (props: EntityDetailsDialogProps) => {

  const [open, setOpen] = useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onOpenChange)
      props.onOpenChange(open);
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

      <DialogContent className="p-0 max-w-3xl rounded-lg">
        <EntityDetails 
          entity={props.entity}
          onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )

}