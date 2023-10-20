import { useState } from 'react'; 
import { CaseSensitive, Hash, XCircle } from 'lucide-react';
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
import { Badge } from '@/ui/Badge';

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
              <TableHead className="w-[450px]">Description</TableHead>
              <TableHead className="w-[300px]">Schema</TableHead>
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
                <TableCell>
                  {e.schema?.map(property => (
                    <span 
                      className="align-middle inline-flex bg-muted-foreground/40 text-dark text-xs 
                        mx-0.5 mb-0.5 py-0.5 px-1.5 rounded-full items-center" style={{ fontSize: '0.65rem'}}>
                      {property.type === 'string' ? (
                        <CaseSensitive className="w-4 h-4 mr-0.5" />
                      ) : property.type === 'number' ? (
                        <Hash className="w-3.5 h-3.5 mr-0.5" />
                      ) : null}

                      {property.name}
                    </span>    
                  ))}
                </TableCell>
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