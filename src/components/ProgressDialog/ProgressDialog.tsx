import { Table2 } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent } from '@/ui/Dialog';
import { Progress } from '@/ui/Progress';
import { DialogDescription } from '@radix-ui/react-dialog';
import { ReactElement } from 'react';

interface ProgressDialogProps {

  icon?: ReactElement;

  title?: string;

  message: string;

  open: boolean;

  progress: number;

}

export const ProgressDialog = (props: ProgressDialogProps) => {

  return (
    <Dialog open={props.open}>
      <DialogContent closeIcon={false}>
        <DialogTitle className="flex items-center gap-2">
          {props.icon} {props.title || 'Processing'}
        </DialogTitle>

        <div className="pb-4">
          <DialogDescription className="text-sm leading-relaxed pt-6 pb-3 px-0.5">
            {props.message}
          </DialogDescription>

          <Progress value={props.progress} />

          <div className="text-center text-muted-foreground text-sm pt-3">
            {Math.round(props.progress)} %
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}