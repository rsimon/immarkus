import { ReactNode, useEffect, useState } from 'react';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Switch } from '@/ui/Switch';
import { useToast } from '@/ui/Toaster';
import { EntityTypeSelector } from './EntityTypeSelector';
import { EntityType } from '@/model';

interface RelationshipTypeEditorProps {

  children?: ReactNode;

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const RelationshipTypeEditor = (props: RelationshipTypeEditorProps) => {

  const { toast } = useToast();

  const { addRelationshipType } =  useDataModel();

  const [open, setOpen] = useState(props.open);

  const [name, setName] = useState('');

  const [isSourceRestricted, setIsSourceRestricted] = useState(false);

  const [sourceType, setSourceType] = useState<EntityType | undefined>();

  const [isTargetRestricted, setIsTargetRestricted] = useState(false);

  const [targetType, setTargetType] = useState<EntityType | undefined>();

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onOpenChange)
      props.onOpenChange(open);
  }

  const onSave = () => {
    setOpen(false);
    
    if (name) {
      addRelationshipType({
        name,
        sourceTypeId: sourceType?.id,
        targetTypeId: targetType?.id
      }).catch(error => {
          console.error(error);

          toast({
            variant: 'destructive',
            // @ts-ignore
            title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> Error</ToastTitle>,
            description: 'Something went wrong. Could not save entity type.'
          });  
        });
    }

    setName('');
  }

  const onRestrictSource = (restrict: boolean) => {
    if (!restrict) {
      setSourceType(undefined);
    }
    setIsSourceRestricted(restrict);
  }

  const onRestrictTarget = (restrict: boolean) => {
    if (!restrict) {
      setTargetType(undefined);
    }
    setIsTargetRestricted(restrict);
  }

  useEffect(() => {
    if (sourceType) setIsSourceRestricted(true);
  }, [sourceType]);

  useEffect(() => {
    if (targetType) setIsTargetRestricted(true);
  }, [targetType]);

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

        <form onSubmit={evt => evt.preventDefault()}>
          <fieldset className="mt-6">
            <Label 
              htmlFor="relationship-type"
              className="inline-block mb-1.5 ml-0.5">Relationship Name
            </Label>

            <Input
              id="relationship-type"
              className="bg-white mt-1.5"
              value={name}
              onChange={evt => setName(evt.target.value)} />
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
                  value={sourceType} 
                  onChange={setSourceType} />
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
                  value={targetType} 
                  onChange={setTargetType} />
              </div>
            </div>
          </fieldset>

          <Button 
            className="w-full mt-4 mb-3"
            disabled={!name}
            onClick={onSave}>
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )


}