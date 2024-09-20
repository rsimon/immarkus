import { ReactNode, useEffect, useState } from 'react';
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

  relationshipType?: RelationshipType;

  onClose?(): void;

}

export const RelationshipTypeEditor = (props: RelationshipTypeEditorProps) => {

  const { relationshipType } = props;

  const { toast } = useToast();

  const { upsertRelationshipType } =  useDataModel();

  const [open, setOpen] = useState(props.open);

  const [relationship, setRelationship] = useState<Partial<RelationshipType>>(relationshipType || {});

  const [isSourceRestricted, setIsSourceRestricted] = useState(Boolean(relationship.sourceTypeId));

  const [isTargetRestricted, setIsTargetRestricted] = useState(Boolean(relationship.targetTypeId));

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
            title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> Error</ToastTitle>,
            description: 'Something went wrong. Could not save entity type.'
          });  
        });
    }

    setOpen(false);
    if (props.onClose) props.onClose();
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
          New Relationship Type
        </DialogTitle>
        
        <DialogDescription className="hidden">
          Create a new relationship type below.
        </DialogDescription>

        <fieldset className="mt-6">
          <Label 
            htmlFor="relationship-name"
            className="inline-block mb-1.5 ml-0.5">Relationship Name
          </Label>

          <Input
            id="relationship-name"
            className="bg-white mt-1.5"
            value={relationship.name || ''}
            onChange={evt => setRelationship(r => ({...r, name: evt.target.value }))} />
        </fieldset>

        <fieldset className="mt-6">
          <Label 
            htmlFor="relationship-description"
            className="inline-block text-xs mb-1.5 ml-0.5">Relationship Type Description</Label>

          <Textarea 
            id="relationship-description"
            className="bg-white"
            rows={3} 
            value={relationship.description || ''}
            onChange={evt => setRelationship(r => ({...r, description: evt.target.value }))} />
        </fieldset>

        <fieldset className="pt-8">
          <div className="flex items-start gap-3">
            <Switch 
              id="restrict-source" 
              className="mt-0.5" 
              checked={isSourceRestricted} 
              onCheckedChange={onRestrictSource} />

            <div>
              <Label htmlFor="restrict-source">
                Restrict source entity class
              </Label>

              <p className="text-muted-foreground text-xs mt-1">
                The relationship can only start on annotations 
                with this entity class.
              </p>

              <EntityTypeSelector 
                value={relationship.sourceTypeId} 
                onChange={sourceTypeId => setRelationship(r => ({...r, sourceTypeId }))} />
            </div>
          </div>
        </fieldset>

        <fieldset className="pt-6 pb-4">
          <div className="flex items-start gap-3">
            <Switch 
              id="restrict-source" 
              className="mt-0.5" 
              checked={isTargetRestricted}
              onCheckedChange={onRestrictTarget} />

            <div>
              <Label htmlFor="restrict-source">
                Restrict target entity class
              </Label>

              <p className="text-muted-foreground text-xs mt-1">
                The relationship can only end on annotations 
                with this entity class.
              </p>

              <EntityTypeSelector 
                value={relationship.targetTypeId} 
                onChange={targetTypeId => setRelationship(r => ({...r, targetTypeId }))} />
            </div>
          </div>
        </fieldset>

        <Button 
          className="w-full mt-4 mb-3"
          disabled={!relationship.name}
          onClick={onSave}>
          Save
        </Button>
      </DialogContent>
    </Dialog>
  )


}