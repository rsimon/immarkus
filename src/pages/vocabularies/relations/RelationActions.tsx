import { Button } from '@/components/Button';
import { MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Dialog';

export const RelationActions = () => {

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
            You will be able to edit and delete relations here. (Soon.)
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )

}