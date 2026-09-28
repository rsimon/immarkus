import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadedImage } from '@/model';
import { AnnotationBatch } from '@/services';
import { Button } from '@/ui/Button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogTrigger 
} from '@/ui/Dialog';

interface AutoAnnotateDialogProps {

  disabled?: boolean;

  image: LoadedImage;

  onImport(batches: AnnotationBatch[]): void;

}

export const AutoAnnotateDialog = (props: AutoAnnotateDialogProps) => {

  const { t } = useTranslation('smartTools');

  const [open, setOpen] = useState(false);

  return (
    <Dialog 
      open={open} 
      onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button 
          disabled={props.disabled}
          className="bg-orange-400 hover:bg-orange-400/90 w-full h-9 mt-3 tracking-wide">
          {t('autoAnnotate.selectService')}
        </Button>
      </DialogTrigger>

      <DialogContent 
        closeIcon={false}
        className="rounded-lg w-11/12 h-11/12 max-w-11/12 p-0 overflow-hidden relative">
        <DialogTitle className="sr-only">
          {t('autoAnnotate.dialogTitle')}
        </DialogTitle>

        <DialogDescription className="sr-only">
          {t('autoAnnotate.dialogDescription')}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )

}