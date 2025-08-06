import { X } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/ui/Button';
import { CompareDialogAnnotationCard } from './CompareDialogAnnotationCard';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle
} from '@/ui/Dialog';

interface CompareDialogProps {

  open: boolean;

  selected: ImageAnnotation[];

  onClose(): void;

}

export const CompareDialog = (props: CompareDialogProps) => {

  const onOpenChange = (open: boolean) => {
    if (!open)
      props.onClose();
  }

  return (
    <Dialog 
      open={props.open} 
      onOpenChange={onOpenChange}>

      <DialogContent 
        closeIcon={false}
        className="rounded-lg flex flex-col md:w-auto h-11/12 max-w-11/12 p-0 
          overflow-hidden relative gap-1">
        <div className="flex items-center justify-between w-full px-5 py-3 ">
          <DialogTitle className="font-medium text-base">
            Compare {props.selected.length} Annotations
          </DialogTitle>

          <DialogClose asChild>
            <Button 
              variant="ghost"
              size="icon"
              className="-mr-2">
              <X className="size-5" />
            </Button>
          </DialogClose>
        </div>

        <DialogDescription className="sr-only">
          Compare {props.selected.length} Annotations
        </DialogDescription>
        
        <div className="grow relative overflow-x-auto overflow-y-hidden px-4 pb-3">
          <div className="flex h-full">
            {props.selected.map(annotation => (
              <CompareDialogAnnotationCard 
                key={annotation.id}
                annotation={annotation} />
            ))}

            <div className="shrink-0"><div className="w-3 h-2"/></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}