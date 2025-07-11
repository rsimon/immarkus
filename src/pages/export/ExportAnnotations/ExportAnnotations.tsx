import { FileChartColumn, FileJson, ScissorsLineDashed, SquareDashed, Table2, TriangleDashed } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { exportAnnotationsAsJSONLD, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { SnippetExportMode, useExcelAnnotationExport } from '@/store/hooks/useExcelAnnotationExport';
import { ProgressDialog } from '@/components/ProgressDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import { useState } from 'react';

export const ExportAnnotations = () => {

  const store = useStore();

  const [snippetMode, setSnippetMode] = useState<SnippetExportMode>('unmasked');

  const { 
    exportAnnotations: exportAnnotationsAsExcel, 
    busy, 
    progress
  } = useExcelAnnotationExport(snippetMode);

  return (
    <> 
      <ul className="py-2 space-y-5">
        <li>
          <div className="max-w-2xl py-4 px-6 bg-white border rounded">
            <h3 className="font-medium leading-relaxed">
              Annotation Data
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              All annotations, on all images in your current work folder, as a flat list
              in <a 
                className="underline underline-offset-4 hover:text-primary" 
                href="https://www.w3.org/TR/annotation-model/" target="_blank">W3C Web Annotation</a> JSON-LD format.
            </p>

            <div className="flex justify-end pt-3">
              <Button
                className="whitespace-nowrap flex gap-3 w-36"
                onClick={() => exportAnnotationsAsJSONLD(store)}>
                <FileJson className="h-5 w-5" /> JSON-LD
              </Button>
            </div>
          </div>
        </li>

        <li>
          <div className="max-w-2xl py-4 px-6 bg-white border rounded">
            <h3 className="font-medium leading-relaxed">
              Annotations and Images
            </h3>

            <p className="text-sm pt-3 leading-relaxed">
              All annotations, on all images in your current work folder, as an Excel file. 
              Each top-level Entity Class will appear on a separate worksheet. 
            </p>

            <p className="text-sm pt-3 leading-relaxed">
              Image snippets are included as a spreadsheet column. Choose your 
              preferred format:
            </p>

            <ul className="list-disc text-sm leading-relaxed pt-1 pb-5 space-y-1">
              <li className="ml-5">
                <strong>Bounding box snippets</strong>: rectangular images showing the full 
                area around each annotation.
              </li>
              <li className="ml-5">
                <strong>Exact shape snippets</strong>: images clipped precisely to the annotated 
                shape (applies to polygons and ellipses).
              </li>
            </ul>

            <div className="flex justify-end gap-2 pt-3">
              <Select
                value={snippetMode}
                onValueChange={m => setSnippetMode(m as SnippetExportMode)}>
                <SelectTrigger 
                  className="h-auto bg-transparent gap-1.5">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="unmasked">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <SquareDashed className="size-4" /> Export bounding box snippets
                    </div>
                  </SelectItem>

                  <SelectItem 
                    value="masked">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <TriangleDashed className="size-4 rotate-[-15deg]" /> Export exact shape snippets
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button 
                disabled={busy}
                className="whitespace-nowrap flex gap-3 w-36"
                onClick={() => exportAnnotationsAsExcel()}>
                {busy ? (
                  <Spinner className="w-4 h-4 text-white" />
                ) : (
                  <><FileChartColumn className="h-5 w-5" /> XLSX</>
                )}
              </Button>
            </div>
          </div>
        </li>
      </ul>

      <ProgressDialog
        icon={<Table2 className="h-5 w-5" />}
        message="Exporting XLSX. This may take a while."
        open={busy}
        progress={progress} />
    </>
  )

}