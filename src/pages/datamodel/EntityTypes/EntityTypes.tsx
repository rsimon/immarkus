import { useState } from 'react'; 
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { useToast, ToastTitle } from '@/ui/Toaster';
import { EntityTypesTable } from './EntityTypesTable';

export const EntityTypes = () => {

  const { toast } = useToast();

  const { removeEntityType } =  useDataModel();

  const [edited, setEdited] = useState<EntityType | undefined>();

  const onDeleteEntityType = (type: EntityType) =>
    removeEntityType(type)
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
      <p className="p-1 mt-4 text-sm max-w-xl leading-6">
        Use Entity Classes to annotate specific concepts or things with your annotations, and record details 
        like the the material of an item, or the number of legs on an animal.
      </p>

      <EntityTypesTable
        onEditEntityType={setEdited}
        onDeleteEntityType={onDeleteEntityType} />

      <EntityTypeEditor 
        open={Boolean(edited)} 
        entityType={edited}
        onOpenChange={open => !open && setEdited(undefined)} />

      <div className="flex mt-4">
        <EntityTypeEditor>
          <Button>
            Create New Entity
          </Button>
        </EntityTypeEditor>
      </div>
    </>
  )

}