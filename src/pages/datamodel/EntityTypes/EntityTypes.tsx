import { useState } from 'react'; 
import { CaseSensitive, Hash, Link2, List, MapPin, XCircle } from 'lucide-react';
import { EntityDetailsDialog } from '@/components/EntityDetails';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { useToast, ToastTitle } from '@/ui/Toaster';
import { EntityTypeActions } from './EntityTypeActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/Table';

export const EntityTypes = () => {

  const { toast } = useToast();

  const { model, removeEntityType } =  useDataModel();

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
        Use Entity Classes to annotate specific concepts, and to record details 
        such as the the material or style of an item, or the number of
        legs on an animal.
      </p>

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
            {model.entityTypes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground">
                  No entities
                </TableCell>
              </TableRow>
            ) : model.entityTypes.map(e => (
              <TableRow key={e.id} className="text-xs">
                <TableCell className="p-2">
                  <span className="pip" style={{ backgroundColor: e.color }} />
                </TableCell>
                <TableCell className="whitespace-nowrap px-3 py-2">{e.id}</TableCell>
                <TableCell className="font-medium px-3 py-2 whitespace-nowrap">{e.label}</TableCell>
                <TableCell className="p-2">{e.description}</TableCell>
                <TableCell className="p-2">
                  {e.properties?.map(property => (
                    <span key={property.name}
                      className="align-middle inline-flex bg-muted-foreground/40 text-dark text-xs 
                        mx-0.5 mb-1 py-0.5 px-1.5 rounded-full items-center" style={{ fontSize: '0.65rem'}}>
                      {property.type === 'text' ? (
                        <CaseSensitive className="w-4 h-4 mr-0.5" />
                      ) : property.type === 'number' ? (
                        <Hash className="w-3 h-3 mr-0.5" />
                      ) : property.type === 'enum' ? (
                        <List className="w-3 h-3 mr-0.5" />
                      ) : property.type === 'uri' ? (
                        <Link2 className="w-3 h-3 mr-0.5" />
                      ) : property.type === 'geocoordinate' ? (
                        <MapPin className="w-3 h-3 mr-0.5" />
                      ) : null}
                      {property.name}
                    </span>    
                  ))}
                </TableCell>
                <TableCell className="text-right p-2">
                  <EntityTypeActions 
                    onEditEntityType={() => setEdited(e)} 
                    onDeleteEntityType={onDeleteEntityType(e)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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