import { useState } from 'react';
import { Cuboid, Import } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DataModelImport } from '@/components/DataModelImport';
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { useToast, ToastTitle } from '@/ui/Toaster';
import { EntityTypesTable } from './EntityTypesTable';

export const EntityTypes = () => {

  const { t } = useTranslation('datamodel');

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
          title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> {t('entityTypes.errorTitle')}</ToastTitle>,
          description: t('entityTypes.errorCouldNotDelete')
        });    
      });

  return (
    <>
      <p className="p-1 mt-4 text-sm max-w-xl leading-6">
        {t('entityTypes.description')}
      </p>

      <EntityTypesTable
        onEditEntityType={setEdited}
        onDeleteEntityType={onDeleteEntityType} />

      <div className="flex mt-4 gap-2">
        <EntityTypeEditor>
          <Button>
            <Cuboid size={16} className="mr-2" /> {t('entityTypes.createNew')}
          </Button>
        </EntityTypeEditor>

        <DataModelImport type="ENTITY_TYPES">
          <Button variant="outline">
            <Import className="h-4 w-4 mr-2" /> {t('entityTypes.importModel')}
          </Button>
        </DataModelImport>
      </div>

      <EntityTypeEditor 
        open={Boolean(edited)} 
        entityType={edited}
        onOpenChange={open => !open && setEdited(undefined)} />
    </>
  )

}