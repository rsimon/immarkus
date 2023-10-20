import { useState } from 'react'; 
import { XCircle } from 'lucide-react';
import { EntityDetailsDialog } from '@/components/EntityDetails';
import { Entity } from '@/model';
import { Store, useVocabulary } from '@/store';
import { Button } from '@/ui/Button';
import { useToast, ToastTitle } from '@/ui/Toaster';
import { EntityActions } from './EntityActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/Table';

export const EntitiesTab = (props: { store: Store }) => {

  const { vocabulary, removeEntity } =  useVocabulary();

  const { toast } = useToast();

  const [editExisting, setEditExisting] = useState<Entity | undefined>();

  const onDeleteEntity = (entity: Entity) => () =>
    removeEntity(entity)
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
      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="w-[600px]">Description</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {vocabulary.entities.map(e => (
              <TableRow key={e.id}>
                <TableCell>
                  <span className="pip" style={{ backgroundColor: e.color }} />
                </TableCell>
                <TableCell>{e.id}</TableCell>
                <TableCell className="font-medium">{e.label}</TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell className="text-right">
                  <EntityActions 
                    onEditEntity={() => setEditExisting(e)} 
                    onDeleteEntity={onDeleteEntity(e)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EntityDetailsDialog 
        open={Boolean(editExisting)} 
        entity={editExisting}
        onOpenChange={open => !open && setEditExisting(undefined)} />

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