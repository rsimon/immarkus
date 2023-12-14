import { useState } from 'react'; 
import { EntityDetailsDialog } from '@/components/EntityDetails';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { useToast, ToastTitle } from '@/ui/Toaster';
import { EntityTypesTable } from './EntityTypesTable';

export const EntityTypes = () => {

  const { toast } = useToast();

  const { removeEntityType } =  useDataModel();

  const [edited, setEdited] = useState<EntityType | undefined>();

  const onDeleteEntityType = (type: EntityType) => () => removeEntityType(type)
    .catch(error => {
      console.error(error);
      toast({
        variant: 'destructive',
        // @ts-ignore
        title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> Error</ToastTitle>,
        description: 'Could not delete entity'
      });    
    });

  return (
    <>
      <p className="p-1 mt-4 text-sm max-w-lg leading-6">
        Use Entity Classes to annotate specific concepts or things, and to record details 
        like the the material of an item, or the number of legs on an animal.
      </p>

      <EntityTypesTable
        onEditEntityType={setEdited}
        onDeleteEntityType={onDeleteEntityType} />

      <EntityDetailsDialog 
        open={Boolean(edited)} 
        entityType={edited}
        onOpenChange={open => !open && setEdited(undefined)} />

      <div className="flex mt-4">
        <EntityDetailsDialog>
          <Button>
            Create New Entity
          </Button>
        </EntityDetailsDialog>
      </div>
    </>
  )

}