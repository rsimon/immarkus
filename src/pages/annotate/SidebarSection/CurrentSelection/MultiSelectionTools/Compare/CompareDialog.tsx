import { useState } from 'react';
import { Columns3 } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogTrigger 
} from '@/ui/Dialog';
import { PropertiesForm } from '../../PropertiesForm';

interface CompareDialogProps {

  selected: ImageAnnotation[];

}

export const CompareDialog = (props: CompareDialogProps) => {

  const [open, setOpen] = useState(false);

  const onOpenChange = (open: boolean) => {
    // For future use...
    setOpen(open);
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      <DialogTrigger asChild>
        <Button className="flex gap-2">
          <Columns3 className="size-5" /> Compare
        </Button>
      </DialogTrigger>

      <DialogContent 
        closeIcon={false}
        className="rounded-lg w-11/12 h-11/12 max-w-11/12 p-0 overflow-hidden relative">
        <DialogTitle className="sr-only">
          Compare
        </DialogTitle>

        <DialogDescription className="sr-only">
          Compare {props.selected.length} Annotations
        </DialogDescription>
        
        <div className="flex h-full gap-4 overflow-hidden relative">
          {props.selected.map(annotation => (
            <div className="border border-red-500">
              <PropertiesForm 
                annotation={annotation}
                onAddTag={() => {}} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )

}