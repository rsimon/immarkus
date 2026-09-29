import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnnotationServicePreview, useAnnotationServiceConnector } from '@/components/AnnotationServices';
import { LoadedImage } from '@/model';
import { AnnotationBatch } from '@/services';
import { Button } from '@/ui/Button';
import { TooltipProvider } from '@/ui/Tooltip';
import { TranscriptionControls } from './TranscriptionControls';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogTrigger 
} from '@/ui/Dialog';

interface TranscriptionDialogProps {

  disabled?: boolean;

  image: LoadedImage;

  onImport(batches: AnnotationBatch[]): void;

}

export const TranscriptionDialog = (props: TranscriptionDialogProps) => {
  const { t } = useTranslation('smartTools');

  const [open, setOpen] = useState(false);

  const { 
    annotations, 
    batches, 
    input,
    options,
    status, 
    tags,
    clearResults,
    reset,
    setConnector,
    setServiceOption,
    setTags,
    submit, 
    updateInput
  } = useAnnotationServiceConnector('TRANSCRIPTION', props.image);
  
  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open)
      reset();
  }

  const onImportAnnotations = () => {
    if (!batches) return;
      
    props.onImport(batches);

    setOpen(false);
    reset();
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      <DialogTrigger asChild>
        <Button 
          disabled={props.disabled}
          className="bg-orange-400 hover:bg-orange-400/90 w-full h-9 mt-3 tracking-wide">
          {t('transcribe.selectService')}
        </Button>
      </DialogTrigger>

      <DialogContent 
        closeIcon={false}
        className="rounded-lg w-11/12 h-11/12 max-w-11/12 p-0 overflow-hidden relative">
        <DialogTitle className="sr-only">
          {t('transcribe.dialogTitle')}
        </DialogTitle>

        <DialogDescription className="sr-only">
          {t('transcribe.dialogDescription')}
        </DialogDescription>
        
        <div className="flex h-full gap-4 overflow-hidden relative">
          <TooltipProvider>
            <div className="p-3 flex-2 min-w-0">
              <div className="h-full rounded bg-muted border">
                <AnnotationServicePreview 
                  annotations={annotations}
                  image={props.image} 
                  status={status}
                  onUpdateInput={updateInput}
                  onClearAnnotations={clearResults}
                  onImportAnnotations={onImportAnnotations} />
              </div>
            </div>

            <div className="flex-1 min-w-0 px-3 pl-0 relative overflow-y-auto">
              <TranscriptionControls
                status={status}
                options={options}
                input={input}
                entityTags={tags}
                onConnectorChanged={setConnector}
                onServiceOptionChanged={setServiceOption}
                onEntityTagsChanged={setTags}
                onCancel={() => onOpenChange(false)}
                onSubmit={submit} />
            </div>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  )

}