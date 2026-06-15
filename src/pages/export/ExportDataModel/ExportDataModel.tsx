import { FileJson } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';

export const ExportDataModel = () => {

  const { t } = useTranslation('export');

  const datamodel = useDataModel();

  const exportData = (data: any, filename: string) => {
    const str = JSON.stringify(data);
    const encoded = new TextEncoder().encode(str);
    const blob = new Blob([encoded], {
      type: 'application/json;charset=utf-8'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
  }

  return (
    <ul className="py-2 space-y-5">
      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            {t('dataModel.entityClassesTitle')}
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            {t('dataModel.entityClassesDescription')}
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel.entityTypes, 'entity-classes.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            {t('dataModel.relationshipTypesTitle')}
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            {t('dataModel.relationshipTypesDescription')}
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel.relationshipTypes, 'relationship-types.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            {t('dataModel.imageSchemasTitle')}
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            {t('dataModel.imageSchemasDescription')}
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel.imageSchemas, 'image-metadata-schema.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            {t('dataModel.folderSchemasTitle')}
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            {t('dataModel.folderSchemasDescription')}
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel.folderSchemas, 'folder-metadata-schema.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            {t('dataModel.fullModelTitle')}
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            <Trans
              ns="export"
              i18nKey="dataModel.fullModelDescription"
              components={{
                fileName: <code className="text-muted-foreground" />
              }} />
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel, '_immarkus.model.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>
    </ul>
  )

}