import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityType } from '@/model';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { Editor } from './Editor';
import { useToast } from '@/ui/Toaster';

interface EntityTypeDialogProps {

  children?: ReactNode;

  entityType?: EntityType;

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const EntityTypeEditor = (props: EntityTypeDialogProps) => {

  const { t } = useTranslation('common');

  const { toast } = useToast();

  const [open, setOpen] = useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onOpenChange)
      props.onOpenChange(open);
  }

  const onSaveError = (error: Error) => {
    console.error(error);
    
    toast({
      variant: 'destructive',
      // @ts-ignore
      title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> {t('entityTypeEditor.errorTitle')}</ToastTitle>,
      description: t('entityTypeEditor.saveError')
    });
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

      <DialogContent className="p-0 max-w-4xl my-8 rounded-lg">
        <DialogTitle className="hidden">
          {t('entityTypeEditor.dialogTitle')}
        </DialogTitle>

        <DialogDescription className="hidden">
          {t('entityTypeEditor.dialogDescription')}
        </DialogDescription>

        <Editor 
          entityType={props.entityType}
          onSaved={() => onOpenChange(false)} 
          onSaveError={onSaveError} />
      </DialogContent>
    </Dialog>
  )

}