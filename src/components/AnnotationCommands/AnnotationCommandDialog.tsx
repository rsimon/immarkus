import {
  Dialog,
  DialogContent,
  DialogTrigger
} from '@/ui/Dialog';
import { AnnotationCommands } from './AnnotationCommands';

export const AnnotationCommandDialog = () => {

  return (
    <Dialog defaultOpen={true}>
      <DialogTrigger asChild>
        <button>Open</button>
      </DialogTrigger>

      <DialogContent className="p-0 max-w-md rounded-lg">
        <AnnotationCommands />
      </DialogContent>
    </Dialog>
  )

}