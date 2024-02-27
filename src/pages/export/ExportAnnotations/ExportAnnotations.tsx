import { useState } from 'react';
import { Binary, Download } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
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
          <div className="w-full py-2 flex flex-row gap-20 justify-between">
            <div>
              <h3 className="font-medium mb-1 leading-relaxed">
                All Annotations
              </h3>

              <p className="text-sm">
                All annotations, on all images in your current work folder, as a flat list
                in <a className="underline underline-offset-4 hover:text-primary" href="https://www.w3.org/TR/annotation-model/" target="_blank">W3C Web Annotation format</a>.
              </p>
            </div>

            <div>
              <Button 
                className="whitespace-nowrap flex gap-2 w-32"
                onClick={() => exportAnnotationsAsJSONLD(store)}>
                <Download className="h-4 w-4" /> JSON-LD
              </Button>
            </div>
          </div>
        </li>

        <li>
          <div className="w-full py-2 flex flex-row gap-20 justify-between">
            <div>
              <h3 className="font-medium mb-1 leading-relaxed">
                Annotations and Images
              </h3>

              <p className="text-sm">
                All annotations, on all images in your current work folder, as an Excel file. This export 
                will also include the annotated images snippets.
              </p>
            </div>

            <div>
              <Button 
                disabled={busy}
                className="whitespace-nowrap flex gap-2 w-32"
                onClick={onExportXLSX}>
                {busy ? (
                  <Spinner className="w-4 h-4 text-white" />
                ) : (
                  <><Download className="h-4 w-4" /> XLS</>
                )}
              </Button>
            </div>
          </div>
        </li>
      </ul>

      <Dialog open={!busy}>
        <DialogContent>
          Processing

          <Progress value={progress} />
        </DialogContent>
      </Dialog>
    </>
  )

}