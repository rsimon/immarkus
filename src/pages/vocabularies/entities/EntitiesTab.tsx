import { useState } from 'react'; 
import { CaseSensitive, Hash, Link2, List, MapPin, XCircle } from 'lucide-react';
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
          <TableHeader className="text-xs">
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
            {vocabulary.entities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground">
                  No entities
                </TableCell>
              </TableRow>
            ) : vocabulary.entities.map(e => (
              <TableRow key={e.id} className="text-xs">
                <TableCell className="p-2">
                  <span className="pip" style={{ backgroundColor: e.color }} />
                </TableCell>
                <TableCell className="whitespace-nowrap px-3 py-2">{e.id}</TableCell>
                <TableCell className="font-medium px-3 py-2 whitespace-nowrap">{e.label}</TableCell>
                <TableCell className="p-2">{e.description}</TableCell>
                <TableCell className="p-2">
                  {e.schema?.map(property => (
                    <span key={property.name}
                      className="align-middle inline-flex bg-muted-foreground/40 text-dark text-xs 
                        mx-0.5 mb-1 py-0.5 px-1.5 rounded-full items-center" style={{ fontSize: '0.65rem'}}>
                      {property.type === 'string' ? (
                        <CaseSensitive className="w-4 h-4 mr-0.5" />
                      ) : property.type === 'number' ? (
                        <Hash className="w-3 h-3 mr-0.5" />
                      ) : property.type === 'enum' ? (
                        <List className="w-3 h-3 mr-0.5" />
                      ) : property.type === 'uri' ? (
                        <Link2 className="w-3 h-3 mr-0.5" />
                      ) : property.type === 'coordinate' ? (
                        <MapPin className="w-3 h-3 mr-0.5" />
                      ) : null}
                      {property.name}
                    </span>    
                  ))}
                </TableCell>
                <TableCell className="text-right p-2">
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