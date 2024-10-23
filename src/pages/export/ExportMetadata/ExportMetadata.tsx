import { FileChartColumn, FileSpreadsheet } from 'lucide-react';
import { exportFolderMetadataCSV, exportFolderMetadataExcel, exportImageMetadataCSV, exportImageMetadataExcel, useStore } from '@/store';
import { Button } from '@/ui/Button';

export const ExportMetadata = () => {

  const store = useStore();

  return (
    <ul className="py-2 space-y-5">
      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium mb-1 leading-relaxed">
            Image Metadata
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Image metadata, available in two versions: as a flattened CSV with one row per image and one column per metadata 
            schema field, or an Excel spreadsheet. The Excel spreadsheet has separate worksheets for each image
            metada schema.
          </p>

          <div className="flex justify-end pt-3 gap-2">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36"
              variant="outline"
              onClick={() => exportImageMetadataCSV(store)}>
              <FileSpreadsheet className="h-4 w-4" /> CSV
            </Button>

            <Button 
              className="whitespace-nowrap flex gap-3 w-36"
              onClick={() => exportImageMetadataExcel (store)}>
              <FileChartColumn className="h-4 w-4" /> XSLX
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium mb-1 leading-relaxed">
            Folder Metadata
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Folder metadata, available in two versions: as a flattened CSV with one row per folder and one column per metadata 
            schema field, or an Excel spreadsheet. The Excel spreadsheet has separate worksheets for each folder
            metada schema.
          </p>

          <div className="flex justify-end pt-3 gap-2">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36"
              variant="outline"
              onClick={() => exportFolderMetadataCSV(store)}>
              <FileSpreadsheet className="h-4 w-4" /> CSV
            </Button>

            <Button
              className="whitespace-nowrap flex gap-3 w-36"
              onClick={() => exportFolderMetadataExcel(store)}>
              <FileChartColumn className="h-5 w-5" /> XLSX
            </Button>
          </div>
        </div>
      </li>
    </ul>
  )

}