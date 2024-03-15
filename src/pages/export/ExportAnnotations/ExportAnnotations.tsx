import { useState } from 'react';
import { FileBarChart2, FileJson, Table2 } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Dialog, DialogTitle, DialogContent } from '@/ui/Dialog';
import { Progress } from '@/ui/Progress';
import { exportAnnotationsAsExcel } from './exportExcel';
import { exportAnnotationsAsJSONLD } from './exportJSONLD';

export const ExportAnnotations = () => {

  const store = useStore();

  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState(0);

  const onProgress = (progress: number) => {
    setProgress(progress);

    if (progress === 100)
      setBusy(false);
  }

  const onExportXLSX = () => {
    setProgress(0);
    setBusy(true);

    exportAnnotationsAsExcel(store, onProgress);
  }

  return (
    <> 
      <ul className="py-2">
        <li>
          <div className="max-w-xl py-2">
            <h3 className="font-medium leading-relaxed">
              Annotation Data
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              All annotations, on all images in your current work folder, as a flat list
              in <a 
                className="underline underline-offset-4 hover:text-primary" 
                href="https://www.w3.org/TR/annotation-model/" target="_blank">W3C Web Annotation</a> JSON-LD format.
            </p>

            <Button
              className="whitespace-nowrap flex gap-3 w-36"
              onClick={() => exportAnnotationsAsJSONLD(store)}>
              <FileJson className="h-5 w-5" /> JSON-LD
            </Button>
          </div>
        </li>

        <li>
          <div className="max-w-xl pt-16">
            <h3 className="font-medium leading-relaxed">
              Annotations and Images
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              An export of all annotations, on all images in your current work folder, as an Excel file. 
              Each top-level Entity Class will be on a separate worksheet. Image snippets are included
              as a spreadhseet column.
            </p>

            <Button 
              disabled={busy}
              className="whitespace-nowrap flex gap-3 w-36"
              onClick={onExportXLSX}>
              {busy ? (
                <Spinner className="w-4 h-4 text-white" />
              ) : (
                <><FileBarChart2 className="h-5 w-5" /> XLSX</>
              )}
            </Button>
          </div>
        </li>
      </ul>

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
    </>
  )

}