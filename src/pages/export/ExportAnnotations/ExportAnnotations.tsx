import { FileBarChart2, FileJson } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { exportAnnotationsAsJSONLD, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { useExcelAnnotationExport } from '@/store/hooks/useExcelAnnotationExport';
import { ExportProgressDialog } from '@/components/ExportProgressDialog';

export const ExportAnnotations = () => {

  const store = useStore();

  const { 
    exportAnnotations: exportAnnotationsAsExcel, 
    busy, 
    progress
  } = useExcelAnnotationExport();

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
              onClick={() => exportAnnotationsAsExcel()}>
              {busy ? (
                <Spinner className="w-4 h-4 text-white" />
              ) : (
                <><FileBarChart2 className="h-5 w-5" /> XLSX</>
              )}
            </Button>
          </div>
        </li>
      </ul>

      <ExportProgressDialog
        message="Exporting XLSX. This may take a while."
        open={busy}
        progress={progress} />
    </>

  )

}