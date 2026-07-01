import { useState } from 'react';
import { FileChartColumn, FileJson, SquareDashed, Table2, TriangleDashed } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Spinner } from '@/components/Spinner';
import { useStore } from '@/store';
import { exportAnnotationsAsJSONLD } from '@/store/export';
import { Button } from '@/ui/Button';
import { SnippetExportMode, useExcelAnnotationExport } from '@/store/hooks/useExcelAnnotationExport';
import { ProgressDialog } from '@/components/ProgressDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';

export const ExportAnnotations = () => {

  const { t } = useTranslation('export');

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
              {t('annotations.dataTitle')}
            </h3>

            <p className="text-sm pt-3 pb-5 leading-relaxed">
              <Trans
                ns="export"
                i18nKey="annotations.dataDescription"
                components={{
                  w3cLink: <a
                    className="underline underline-offset-4 hover:text-primary"
                    href="https://www.w3.org/TR/annotation-model/" target="_blank" />
                }} />
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
              {t('annotations.imagesTitle')}
            </h3>

            <p className="text-sm pt-3 leading-relaxed">
              {t('annotations.imagesDescription')}
            </p>

            <p className="text-sm pt-3 leading-relaxed">
              {t('annotations.snippetsIntro')}
            </p>

            <ul className="list-disc text-sm leading-relaxed pt-1 pb-5 space-y-1">
              <li className="ml-5">
                <Trans
                  ns="export"
                  i18nKey="annotations.snippetsBoundingBox"
                  components={{ b: <strong /> }} />
              </li>
              <li className="ml-5">
                <Trans
                  ns="export"
                  i18nKey="annotations.snippetsExactShape"
                  components={{ b: <strong /> }} />
              </li>
              <li className="ml-5">
                <Trans
                  ns="export"
                  i18nKey="annotations.noSnippets"
                  components={{ b: <strong /> }} />
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
                      <SquareDashed className="size-4" /> {t('annotations.exportBoundingBox')}
                    </div>
                  </SelectItem>

                  <SelectItem 
                    value="masked">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <TriangleDashed className="size-4 rotate-[-15deg]" /> {t('annotations.exportExactShape')}
                    </div>
                  </SelectItem>

                  <SelectItem 
                    value="no-snippet">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <div className="size-4" /> {t('annotations.exportNoSnippet')}
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
        message={t('exportingXlsx')}
        open={busy}
        progress={progress} />
    </>
  )

}