import { ReactNode, useEffect, useState } from 'react';
import { EntityType } from '@/model';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { EntityDetails } from './EntityDetails';

interface EntityTypeDetailsDialogProps {

  children?: ReactNode;

  entityType?: EntityType

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const EntityDetailsDialog = (props: EntityTypeDetailsDialogProps) => {

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

      <DialogContent className="p-0 max-w-3xl max-h-[94vh] overflow-y-auto rounded-lg">
        <EntityDetails 
          entityType={props.entityType}
          onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )

}