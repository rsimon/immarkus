import { useState } from 'react';
import { FileChartColumn, FileSpreadsheet, Table2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/Button';
import { ProgressDialog } from '@/components/ProgressDialog';
import { useStore } from '@/store';
import {
  exportFolderMetadataCSV,
  exportFolderMetadataExcel,
  exportImageMetadataCSV,
  exportImageMetadataExcel
} from '@/store/export';

export const ExportMetadata = () => {

  const { t } = useTranslation('export');

  const store = useStore();

  const [progress, setProgress] = useState<number | undefined>();

  const onProgress = (progress: number) => {
    if (Math.ceil(progress) === 100)
      setProgress(undefined);
    else
      setProgress(progress);
  }

  return (
    <>
      <ul className="py-2 space-y-5">
        <li>
          <div className="max-w-2xl py-4 px-6 bg-white border rounded">
            <h3 className="font-medium mb-1 leading-relaxed">
              {t('metadata.imageTitle')}
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              {t('metadata.imageDescription')}
            </p>

            <div className="flex justify-end pt-3 gap-2">
              <Button 
                className="whitespace-nowrap flex gap-3 w-36"
                variant="outline"
                onClick={() => exportImageMetadataCSV(store, onProgress)}>
                <FileSpreadsheet className="h-4 w-4" /> CSV
              </Button>

              <Button 
                className="whitespace-nowrap flex gap-3 w-36"
                onClick={() => exportImageMetadataExcel(store, onProgress)}>
                <FileChartColumn className="h-4 w-4" /> XSLX
              </Button>
            </div>
          </div>
        </li>

        <li>
          <div className="max-w-2xl py-4 px-6 bg-white border rounded">
            <h3 className="font-medium mb-1 leading-relaxed">
              {t('metadata.folderTitle')}
            </h3>

            <p className="text-sm pt-3 pb-2 leading-relaxed">
              {t('metadata.folderDescription1')}
            </p>
            <p className="text-sm pb-5 leading-relaxed">
              {t('metadata.folderDescription2')}
            </p>

            <div className="flex justify-end pt-3 gap-2">
              <Button 
                className="whitespace-nowrap flex gap-3 w-36"
                variant="outline"
                onClick={() => exportFolderMetadataCSV(store, onProgress)}>
                <FileSpreadsheet className="h-4 w-4" /> CSV
              </Button>

              <Button
                className="whitespace-nowrap flex gap-3 w-36"
                onClick={() => exportFolderMetadataExcel(store, onProgress)}>
                <FileChartColumn className="h-5 w-5" /> XLSX
              </Button>
            </div>
          </div>
        </li>
      </ul>

      <ProgressDialog
        icon={<Table2 className="h-5 w-5" />}
        message={t('exportingXlsx')}
        open={progress !== undefined}
        progress={progress} />
    </>
  )

}