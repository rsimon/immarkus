import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Switch } from '@/ui/Switch';
import { Textarea } from '@/ui/Textarea';
import { useToast } from '@/ui/Toaster';
import { EntityTypeSelector } from './EntityTypeSelector';

interface RelationshipTypeEditorProps {

  children?: ReactNode;

  open?: boolean;

  relationshipType?: Partial<RelationshipType>;

  onClose?(type?: RelationshipType): void;

}

export const RelationshipTypeEditor = (props: RelationshipTypeEditorProps) => {

  const { t } = useTranslation('common');

  const { relationshipType } = props;

  const { toast } = useToast();

  const { upsertRelationshipType } =  useDataModel();

  const [open, setOpen] = useState(props.open);

  const [relationship, setRelationship] = useState<Partial<RelationshipType>>(relationshipType || {});

  const [isSourceRestricted, setIsSourceRestricted] = useState(Boolean(relationship.sourceTypeId));

  const [isTargetRestricted, setIsTargetRestricted] = useState(Boolean(relationship.targetTypeId));

  useEffect(() => {
    setRelationship(props.relationshipType || {});
  }, [props.relationshipType]);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onClose && !open)
      props.onClose();
  }

  const onSave = () => {
    if (relationship.name) {
      upsertRelationshipType(relationship as RelationshipType)
        .catch(error => {
          console.error(error);

          toast({
            variant: 'destructive',
            // @ts-ignore
            title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> {t('relationshipTypeEditor.errorTitle')}</ToastTitle>,
            description: t('relationshipTypeEditor.saveError')
          });
        });
    }

    if (props.onClose) {
      const saved = relationship.name ? relationship : undefined;
      props.onClose(saved as RelationshipType);
    }

    setOpen(false);
  }

  const onRestrictSource = (restrict: boolean) => {
    if (!restrict) {
      setRelationship(r => ({...r, sourceTypeId: undefined }));
    }
    setIsSourceRestricted(restrict);
  }

  const onRestrictTarget = (restrict: boolean) => {
    if (!restrict) {
      setRelationship(r => ({...r, targetTypeId: undefined }));
    }
    setIsTargetRestricted(restrict);
  }

  useEffect(() => {
    if (relationship.sourceTypeId) setIsSourceRestricted(true);
  }, [relationship.sourceTypeId]);

  useEffect(() => {
    if (relationship.targetTypeId) setIsTargetRestricted(true);
  }, [relationship.targetTypeId]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      {props.children && (
        <DialogTrigger asChild>
          {props.children}
        </DialogTrigger>
      )}

      <DialogContent className="px-8 py-3 max-md my-8 rounded-lg">
        <DialogTitle className="hidden">
          {t('relationshipTypeEditor.dialogTitle')}
        </DialogTitle>

        <DialogDescription className="hidden">
          {t('relationshipTypeEditor.dialogDescription')}
        </DialogDescription>

        <fieldset className="mt-6">
          <Label 
            htmlFor="relationship-name"
            className="inline-block mb-1.5 ml-0.5">{t('relationshipTypeEditor.relationshipName')}
          </Label>

          <Input
            id="relationship-name"
            className="bg-white mt-1.5"
            value={relationship.name || ''}
            onChange={evt => setRelationship(r => ({...r, name: evt.target.value }))} />
        </fieldset>

        <fieldset>
          <div className="flex items-start gap-3">
            <Switch 
              id="directionality" 
              className="mt-0.5" 
              checked={relationship.directed} 
              onCheckedChange={checked => setRelationship(r => ({...r, directed: checked }))} />

            <div>
              <Label htmlFor="directionality">
                {t('relationshipTypeEditor.directedRelation')}
              </Label>

              <p className="text-muted-foreground text-xs mt-1">
                {t('relationshipTypeEditor.directedHint')}
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <Label 
            htmlFor="relationship-description"
            className="inline-block text-xs mb-1.5 ml-0.5">{t('relationshipTypeEditor.typeDescription')}</Label>

          <Textarea 
            id="relationship-description"
            className="bg-white"
            rows={3} 
            value={relationship.description || ''}
            onChange={evt => setRelationship(r => ({...r, description: evt.target.value }))} />
        </fieldset>

        <fieldset className="pt-6">
          <div className="flex items-start gap-3">
            <Switch 
              id="restrict-source" 
              className="mt-0.5" 
              checked={isSourceRestricted} 
              onCheckedChange={onRestrictSource} />

            <div>
              <Label htmlFor="restrict-source">
                {t('relationshipTypeEditor.restrictSource')}
              </Label>

              <p className="text-muted-foreground text-xs mt-1">
                {t('relationshipTypeEditor.restrictSourceHint')}
              </p>

              <EntityTypeSelector 
                value={relationship.sourceTypeId} 
                onChange={sourceTypeId => setRelationship(r => ({...r, sourceTypeId }))} />
            </div>
          </div>
        </fieldset>

        <fieldset className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Switch 
              id="restrict-source" 
              className="mt-0.5" 
              checked={isTargetRestricted}
              onCheckedChange={onRestrictTarget} />

            <div>
              <Label htmlFor="restrict-source">
                {t('relationshipTypeEditor.restrictTarget')}
              </Label>

              <p className="text-muted-foreground text-xs mt-1">
                {t('relationshipTypeEditor.restrictTargetHint')}
              </p>

              <EntityTypeSelector 
                value={relationship.targetTypeId} 
                onChange={targetTypeId => setRelationship(r => ({...r, targetTypeId }))} />
            </div>
          </div>
        </fieldset>

        <Button 
          className="w-full mt-2 mb-3"
          disabled={!relationship.name}
          onClick={onSave}>
          {t('relationshipTypeEditor.save')}
        </Button>
      </DialogContent>
    </Dialog>
  )


}