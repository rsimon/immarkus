import { ReactNode, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, XCircle } from 'lucide-react';
import { ModelPreset, useRuntimeConfig } from '@/RuntimeConfig';
import { EntityType, MetadataSchema } from '@/model';
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

  type: 'ENTITY_TYPES' | 'FOLDER_SCHEMAS' | 'IMAGE_SCHEMAS';

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const DataModelImport = (props: DataModelImportProps) => {

  const [open, setOpen] = useState(props.open);

  const [replace, setReplace] = useState(false);

  const [keepExisting, setKeepExisting] = useState<string>('keep');

  const config = useRuntimeConfig();

  const model = useDataModel();

  const presets = useMemo(() =>
    (config.model_presets || []).filter(p => p.type === props.type)
  , [config, props.type]);

  const { toast } = useToast();

  const validation = useMemo(() => (
    props.type === 'ENTITY_TYPES' ? validateEntityTypes : validateMetadata
  ), [props.type]);

  const { 
    importEntityTypes, 
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
  
  const onLoadPreset = (preset: ModelPreset) => {
    setOpen(false);

    fetch(preset.url)
      .then(res => res.json())
      .then(importToModel)
      .catch(() => onError(`Error loading preset ${preset.name}`));
  }

  const importToModel = (items: EntityType[] | MetadataSchema[]) => {
    setOpen(false);

    const importItems = 
      props.type === 'ENTITY_TYPES' ? importEntityTypes :
      props.type === 'FOLDER_SCHEMAS' ? importFolderSchemas :
      props.type === 'IMAGE_SCHEMAS' ? importImageSchemas :
      undefined;

    if (!importItems)
      // Should never happen;
      return;

    // @ts-ignore
    importItems(items, replace, keepExisting === 'keep')
      .then(() => {
        toast({
          // @ts-ignore
          title: <ToastTitle className="flex"><Check size={18} className="mr-2" /> Success</ToastTitle>,
          description: props.type === 'ENTITY_TYPES' 
            ? `${items.length} entity classes imported successfully.`
            : `${items.length} schemas imported successfully.`
        });
      })
      .catch(error => {
        console.error(error);
        onError('Error importing to data model');
      });
  }

  const onError = (error: string) =>
    toast({
      variant: 'destructive',
      // @ts-ignore
      title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> Error</ToastTitle>,
      description: error
    });

  const items = props.type === 'ENTITY_TYPES' ? 'classes' : 'schemas';

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
            Import {props.type === 'ENTITY_TYPES' 
              ? 'Entity Classes' : props.type === 'FOLDER_SCHEMAS' 
              ? 'Folder Schemas' : 'Image Schemas'}
          </h2>

          <div className="py-4">
            <div className="flex items-center gap-2 justify-between">
              <Label htmlFor="replace-existing">
                Replace Current Model
              </Label>

              <Switch 
                id="replace-existing" 
                checked={replace} 
                onCheckedChange={setReplace} />
            </div>

            <p className="text-muted-foreground text-xs mt-1 pr-20">
              You can either delete and replace your existing model, or add the 
              imported {items} to your current model.
            </p>

            {replace && !isEmpty && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">Warning</AlertTitle>
                <AlertDescription className="text-sm leading-relaxed">
                  All current {props.type === 'ENTITY_TYPES' ? 'Entity Classes' : 'schemas'} will
                  be deleted from your model.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className={replace ? 'import-duplicates disabled mb-2' : 'import-duplicates mb-2'}>
            <Label htmlFor="replace-existing">
              Duplicate {props.type === 'ENTITY_TYPES' ? 'Classes' : 'Schemas'}
            </Label>

            <p className="text-muted-foreground text-xs mt-1 mb-2">
              Select how the import should merge {items} that 
              already exist in your model.
            </p>

            <div className="py-1">
              <RadioGroup 
                value={keepExisting} 
                onValueChange={setKeepExisting}>
                <div className="flex items-start gap-4 mb-0.5 pl-1">
                  <RadioGroupItem 
                    className="mt-[4px]"
                    value="keep" 
                    id="keep" />

                  <div>
                    <Label htmlFor="keep">Keep Existing</Label>
                    <p className="text-xs text-muted-foreground">
                      If the import contains {items} that 
                      already exist in your model, keep the existing ones and discard the imported {items}.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pl-1">
                  <RadioGroupItem 
                    className="mt-[4px]"
                    value="replace" 
                    id="replace" />

                  <div>
                    <Label htmlFor="replace">Keep Imported</Label>
                    <p className="text-xs text-muted-foreground">
                      If the import contains {items} that already exist in 
                      your model, discard the existing ones and keep the imported {items}.
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
                  Import from Preset
                </Label>

                <Select onValueChange={value => onLoadPreset(presets.find(p => p.name === value))}>
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
                — or —
              </p>
            </>
          ) : (
            <div className="pb-6" />
          )}

          <UploadButton 
            validation={validation}
            onError={onError} 
            onUpload={importToModel} />
        </div>
      </DialogContent>
    </Dialog>
  )

}