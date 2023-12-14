import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { EntityTypeActions } from '../EntityTypeActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/Table';

interface EntityTypesTableProps {

  onEditEntityType(type: EntityType): void;

  onDeleteEntityType(type: EntityType): void;

}

export const EntityTypesTable = (props: EntityTypesTableProps) => {

  const { model } =  useDataModel();

  return (
    <div className="rounded-md border mt-6">
      <Table>
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="whitespace-nowrap">Entity Class</TableHead>
            <TableHead className="whitespace-nowrap">Display Name</TableHead>
            <TableHead className="whitespace-nowrap">Parent Class</TableHead>
            <TableHead className="whitespace-nowrap w-[300px]">Description</TableHead>
            <TableHead className="whitespace-nowrap w-[450px]">Properties</TableHead>
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
                {/*e.properties?.map(property => (
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
                ))*/}
              </TableCell>
              <TableCell className="text-right p-2">
                <EntityTypeActions 
                  onEditEntityType={() => props.onEditEntityType(e)} 
                  onDeleteEntityType={() => props.onDeleteEntityType(e)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

  )

}