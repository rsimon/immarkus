import { FileChartColumn, FileJson, Table2 } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { ProgressDialog } from '@/components/ProgressDialog';
import { Spinner } from '@/components/Spinner';
import { useStore } from '@/store';
import { exportRelationshipsAsJSONLD } from '@/store/export';
import { useExcelRelationshipExport } from '@/store/hooks/useExcelRelationshipExport';
import { Button } from '@/ui/Button';

export const ExportRelationships = () => {

  const { t } = useTranslation('export');

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
      <ul className="py-2 space-y-5">
        <li>
          <div className="max-w-2xl py-4 px-6 bg-white border rounded">
            <h3 className="font-medium leading-relaxed">
              {t('relationships.dataTitle')}
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              <Trans
                ns="export"
                i18nKey="relationships.dataDescription"
                components={{
                  w3cLink: <a
                    className="underline underline-offset-4 hover:text-primary"
                    href="https://www.w3.org/TR/annotation-model/" target="_blank" />
                }} />
            </p>

            <div className="flex justify-end pt-3">
              <Button
                className="whitespace-nowrap flex gap-3 w-36"
                onClick={() => exportRelationshipsAsJSONLD(store)}>
                <FileJson className="h-5 w-5" /> JSON-LD
              </Button>
            </div>
          </div>
        </li>

        <li>
          <div className="max-w-2xl py-4 px-6 bg-white border rounded">
            <h3 className="font-medium leading-relaxed">
              {t('relationships.imagesTitle')}
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              {t('relationships.imagesDescription')}
            </p>

            <div className="flex justify-end pt-3">
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
          </div>
        </li>
      </ul>

      <ProgressDialog
        icon={<Table2 className="h-5 w-5" />}
        message={t('exportingXlsx')}
        open={busy}
        progress={progress} />
    </>
  )

}