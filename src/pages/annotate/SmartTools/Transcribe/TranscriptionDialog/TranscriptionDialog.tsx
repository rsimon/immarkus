import { useState } from 'react';
import { LoadedImage } from '@/model';
import { TranscriptionControls } from './TranscriptionControls';
import { TranscriptionPreview } from './TranscriptionPreview';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogTrigger 
} from '@/ui/Dialog';

interface TranscriptionDialogProps {

  image: LoadedImage;

}

export const TranscriptionDialog = (props: TranscriptionDialogProps) => {

  const [open, setOpen] = useState(false);

  const onOpenChange = (open: boolean) => {
    // TODO
    setOpen(open);
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      <DialogTrigger>
        Go!
      </DialogTrigger>

      <DialogContent 
        className="rounded-lg w-11/12 h-11/12 max-w-11/12 p-2">
        <DialogTitle className="sr-only">
          Auto Transcribe
        </DialogTitle>

        <DialogDescription className="sr-only">
          Submit this image for automatic transcription.
        </DialogDescription>
        
        <div className="flex h-full gap-4">
          <div className="flex-[2] min-w-0 rounded-l overflow-hidden bg-muted border">
            <TranscriptionPreview 
              image={props.image} />
          </div>

          <div className="flex-[1] min-w-0">
            <TranscriptionControls />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}