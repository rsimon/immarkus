import { Table2 } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent } from '@/ui/Dialog';
import { Progress } from '@/ui/Progress';
import { DialogDescription } from '@radix-ui/react-dialog';

interface ExportProgressDialogProps {

  message: string;

  open: boolean;

  progress: number;

}

export const ExportProgressDialog = (props: ExportProgressDialogProps) => {

  return (
    <Dialog open={props.open}>
      <DialogContent closeIcon={false}>
        <DialogTitle className="flex items-center gap-2">
          <Table2 className="h-5 w-5" /> Processing
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