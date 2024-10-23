import { FileChartColumn, FileJson } from 'lucide-react';
import { ExportProgressDialog } from '@/components/ExportProgressDialog';
import { Spinner } from '@/components/Spinner';
import { exportRelationshipsAsJSONLD, useExcelRelationshipExport, useStore } from '@/store';
import { Button } from '@/ui/Button';

export const ExportRelationships = () => {

  const store = useStore();

  const { 
    exportRelationships: exportRelationshipsAsExcel,
    busy, 
    progress
  } = useExcelRelationshipExport();

  const onExportExcel = () => {
    const relationships = store.listAllRelations();
    exportRelationshipsAsExcel(store, relationships, 'relationships.xlsx');
  }

  return (
    <> 
      <ul className="py-2">
        <li>
          <div className="max-w-xl py-2">
            <h3 className="font-medium leading-relaxed">
              Relationship Data
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              All relationships, on all images in your current work folder, as a flat list
              in <a 
                className="underline underline-offset-4 hover:text-primary" 
                href="https://www.w3.org/TR/annotation-model/" target="_blank">W3C Web Annotation</a> JSON-LD format.
            </p>

            <Button
              className="whitespace-nowrap flex gap-3 w-36"
              onClick={() => exportRelationshipsAsJSONLD(store)}>
              <FileJson className="h-5 w-5" /> JSON-LD
            </Button>
          </div>
        </li>

        <li>
          <div className="max-w-xl pt-16">
            <h3 className="font-medium leading-relaxed">
              Relationships and Images
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              An export of all relationships, on all images in your current work folder, as an Excel file. 
              Image snippets are included for the start- and end-annotation of each relationship.
            </p>

            <Button 
              disabled={busy}
              className="whitespace-nowrap flex gap-3 w-36"
              onClick={onExportExcel}>
              {busy ? (
                <Spinner className="w-4 h-4 text-white" />
              ) : (
                <><FileChartColumn className="h-5 w-5" /> XLSX</>
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