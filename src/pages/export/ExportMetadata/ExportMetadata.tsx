import { Download } from 'lucide-react';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { exportImageMetadataCSV } from './exportImageMetadata';
import { exportFolderMetadataCSV } from './exportFolderMetadata';

export const ExportMetadata = () => {

  const store = useStore();

  return (
    <ul className="py-2">
      <li className="w-full py-2 mb-8 flex flex-row gap-20 justify-between">
        <div>
          <h3 className="font-medium mb-1 leading-relaxed">
            Image Metadata
          </h3>

          <p className="text-sm">
            Image metadata as a flat list in CSV spreadsheet format. One row per image, one column per metadata 
            schema field.
          </p>
        </div>

        <div>
          <Button 
            className="whitespace-nowrap flex gap-2"
            onClick={() => exportImageMetadataCSV(store)}>
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </li>

      <li className="w-full py-2 flex flex-row gap-20 justify-between">
        <div>
          <h3 className="font-medium mb-1 leading-relaxed">
            Folder Metadata
          </h3>

          <p className="text-sm">
            Folder metadata as a flat list in CSV spreadsheet format. One row per folder, one column per metadata 
            schema field.
          </p>
        </div>

        <div>
          <Button 
            className="whitespace-nowrap flex gap-2"
            onClick={() => exportFolderMetadataCSV(store)}>
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </li>
    </ul>
  )

}