import { useEffect, useState } from 'react';
import { Table2 } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent } from '@/ui/Dialog';
import { Progress } from '@/ui/Progress';
import { Image } from '@/model';
import { useStore } from '@/store';
import { exportAnnotationsAsExcel } from './exportAnnotations';

interface ExcelAnnotationExportProps {

  images?: Image[];

  onComplete(): void;

}

export const ExcelAnnotationExport = (props: ExcelAnnotationExportProps) => {

  const store = useStore();

  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setBusy(true);
    setProgress(0);

    const onProgress = (progress: number) => {
      setProgress(progress);
  
      if (progress === 100) {
        setBusy(false);
        props.onComplete();
      }
    }

    const images = props.images || store.images;
    exportAnnotationsAsExcel(store, images, onProgress);
  }, [props.images]);

  return (
    <Dialog open={busy}>
      <DialogContent>
        <DialogTitle className="flex items-center gap-2">
          <Table2 className="h-5 w-5" /> Processing
        </DialogTitle>

        <div className="pb-4">
          <p className="text-sm leading-relaxed pt-6 pb-3 px-0.5">
            Exporting XLSX. This may take a while.
          </p>

          <Progress value={progress} />

          <div className="text-center text-muted-foreground text-sm pt-3">
            {Math.round(progress)} %
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}