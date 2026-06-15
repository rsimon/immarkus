import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { AlertCircle, Check, XCircle } from 'lucide-react';
import { EntityType, MetadataSchema, RelationshipType } from '@/model';
import { useDataModel } from '@/store';
import { Alert, AlertDescription, AlertTitle } from '@/ui/Alert';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { Label } from '@/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/ui/RadioGroup';
import { Switch } from '@/ui/Switch';
import { Separator } from '@/ui/Separator';
import { ToastTitle, useToast } from '@/ui/Toaster';
import { UploadButton } from './UploadButton';
import { useDataModelImport, validateEntityTypes, validateMetadata } from './useDataModelImport';
import { useSchemaPresets } from './useSchemaPresets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

import './DataModelImport.css';

interface DataModelImportProps {

  children?: ReactNode;

  type: 'ENTITY_TYPES' | 'RELATIONSHIP_TYPES' | 'FOLDER_SCHEMAS' | 'IMAGE_SCHEMAS';

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const DataModelImport = (props: DataModelImportProps) => {

  const { t } = useTranslation('common');

  const [open, setOpen] = useState(props.open);

  const [replace, setReplace] = useState(false);

  const [keepExisting, setKeepExisting] = useState<string>('keep');

  const model = useDataModel();

  const presets = useSchemaPresets(props.type);

  const { toast } = useToast();

  const validation = useMemo(() => (
    props.type === 'ENTITY_TYPES' ? validateEntityTypes : validateMetadata
  ), [props.type]);

  const { 
    importEntityTypes, 
    importRelationshipTypes,
    importFolderSchemas, 
    importImageSchemas 
  } = useDataModelImport();

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onOpenChange)
      props.onOpenChange(open);
  }

  const importToModel = (items: EntityType[] | RelationshipType[] | MetadataSchema[]) => {
    setOpen(false);

    const importItems: (
      items: EntityType[] | RelationshipType[] | MetadataSchema[], 
      replace: boolean,
      mergePolicyKeep?: boolean
    ) => Promise<void> = 
      props.type === 'ENTITY_TYPES' ? importEntityTypes :
      props.type === 'RELATIONSHIP_TYPES' ? importRelationshipTypes :
      props.type === 'FOLDER_SCHEMAS' ? importFolderSchemas :
      props.type === 'IMAGE_SCHEMAS' ? importImageSchemas :
      undefined;

    if (!importItems)
      // Should never happen;
      return;

    importItems(items, replace, keepExisting === 'keep')
      .then(() => {
        toast({
          // @ts-ignore
          title: <ToastTitle className="flex"><Check size={18} className="mr-2" /> {t('dataModelImport.success')}</ToastTitle>,
          description: props.type === 'ENTITY_TYPES'
            ? t('dataModelImport.entityClassesImported', { count: items.length })
            : t('dataModelImport.schemasImported', { count: items.length })
        });
      })
      .catch(error => {
        console.error(error);
        onError(t('dataModelImport.importError'));
      });
  }

  const onImportPreset = (name: string) => {
    const preset = presets.find(p => p.name === name);
    if (preset)
      importToModel([preset]);
  }

  const onError = (error: string) =>
    toast({
      variant: 'destructive',
      // @ts-ignore
      title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> {t('dataModelImport.error')}</ToastTitle>,
      description: error
    });

  const items = props.type === 'ENTITY_TYPES'
    ? t('dataModelImport.itemsClasses')
    : t('dataModelImport.itemsSchemas');

  const isEmpty = 
    props.type === 'ENTITY_TYPES' ? model.entityTypes.length === 0 :
    props.type === 'FOLDER_SCHEMAS' ? model.folderSchemas.length === 0 :
    props.type === 'IMAGE_SCHEMAS' ? model.imageSchemas.length === 0 : true;

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      {props.children && (
        <DialogTrigger asChild>
          {props.children}
        </DialogTrigger>
      )}

      <DialogContent className="p-0 my-8 rounded-lg">
        <div className="px-7 pt-6 pb-8 leading-relaxed">
          <h2 className="mb-2 font-semibold">
            {props.type === 'ENTITY_TYPES'
              ? t('dataModelImport.title.entityTypes') : props.type === 'FOLDER_SCHEMAS'
              ? t('dataModelImport.title.folderSchemas') : props.type === 'IMAGE_SCHEMAS'
              ? t('dataModelImport.title.imageSchemas') : t('dataModelImport.title.relationshipTypes')}
          </h2>

          <div className="py-4">
            <div className="flex items-center gap-2 justify-between">
              <Label htmlFor="replace-existing">
                {t('dataModelImport.replaceCurrentModel')}
              </Label>

              <Switch 
                id="replace-existing" 
                checked={replace} 
                onCheckedChange={setReplace} />
            </div>

            <p className="text-muted-foreground text-xs mt-1 pr-20">
              {t('dataModelImport.replaceHint', { items })}
            </p>

            {replace && !isEmpty && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">{t('dataModelImport.warning')}</AlertTitle>
                <AlertDescription className="text-sm leading-relaxed">
                  {props.type === 'ENTITY_TYPES'
                    ? t('dataModelImport.replaceWarning.entityTypes')
                    : t('dataModelImport.replaceWarning.schemas')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className={replace ? 'import-duplicates disabled my-2' : 'import-duplicates my-2'}>
            <Label htmlFor="replace-existing">
              {props.type === 'ENTITY_TYPES'
                ? t('dataModelImport.duplicatesTitle.entityTypes')
                : t('dataModelImport.duplicatesTitle.schemas')}
            </Label>

            <p className="text-muted-foreground text-xs mt-1 mb-2">
              {t('dataModelImport.duplicatesHint', { items })}
            </p>

            <div className="py-1">
              <RadioGroup 
                value={keepExisting} 
                onValueChange={setKeepExisting}>
                <div className="flex items-start gap-4 mb-0.5 pl-1">
                  <RadioGroupItem 
                    className="mt-1"
                    value="keep" 
                    id="keep" />

                  <div>
                    <Label htmlFor="keep">{t('dataModelImport.keepExisting')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('dataModelImport.keepExistingHint', { items })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pl-1">
                  <RadioGroupItem 
                    className="mt-1"
                    value="replace" 
                    id="replace" />

                  <div>
                    <Label htmlFor="replace">{t('dataModelImport.keepImported')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('dataModelImport.keepImportedHint', { items })}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {presets.length > 0 ? (
            <>
              <Separator className="my-6" />

              <div className="mt-4">
                <Label 
                  htmlFor="presets"
                  className="inline-block text-xs mb-1.5 ml-0.5">
                  {t('dataModelImport.importFromPreset')}
                </Label>

                <Select 
                  onValueChange={onImportPreset}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {presets.map(preset => (
                      <SelectItem 
                        key={preset.name} 
                        value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="w-full text-xs py-4 text-center text-muted-foreground">
                {t('dataModelImport.orSeparator')}
              </p>
            </>
          ) : (
            <div className="pb-6" />
          )}

          <UploadButton 
            validation={validation}
            onError={onError} 
            onUpload={importToModel} />

          <div className="text-center text-muted-foreground text-xs pt-2">
            <Trans
              ns="common"
              i18nKey="dataModelImport.useExportedFiles"
              components={{
                exportLink: <Link className="text-black hover:underline" to="/export/model" />
              }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}