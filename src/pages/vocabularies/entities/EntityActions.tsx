import { Button } from '@/ui/Button';
import { MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/Dialog';

export const EntityActions = () => {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal size={16} />
        </Button>
      </DialogTrigger>
      
      <DialogContent onOpenAutoFocus={evt => evt.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Coming Soon</DialogTitle>
          <DialogDescription>
            You will be able to edit and delete entities here. (Soon.)
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )

}